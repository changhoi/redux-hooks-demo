# Redux를 Hooks로 작성해보자

지난 데모를 통해서 리덕스 비동기 처리를 어떤 미들웨어를 사용할지 결정을 했다. 이번에는 리덕스 hooks를 사용해 리덕스를 사용해보려고 한다. 사실 지난 프로젝트에서는 `connect` 함수와 `mapStateToProps`, `mapDispatchToProps`를 사용해서 리덕스를 연결시켰는데, 이러한 방법도 있고 hooks를 사용할 수도 있기 때문에, 방법을 한 가지 더 공부해보고 프로젝트에서 결정해보려고 한다. 패턴은 한 번 지정하면 같은 프로젝트 내에서는 동일하게 작성되는 경향이 있기 때문에... 데모를 만들어보고 확인을 해보려고 한다. 이 데모는 기본적으로 지난 [react-async-demo](https://github.com/changhoi/redux-async-demo)에서 만들었던 프로젝트를 기반으로 만들어져 있다.

## Hooks를 적용하기 전

스크린에서 Redux와 연결하려면 아래와 같은 형태로 연결 해줬던 구조이다.

```tsx
import PostScreen from "./PostScreen";
import { connect } from "react-redux";
import { getPost } from "../../redux/modules/post/thunkReducer";

const mapStateToProps = (state: any, ownProps: any) => {
  const { post } = state;
  return {
    ...ownProps,
    ...post
  };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    ...ownProps,
    getPost: () => dispatch(getPost())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
```

위처럼 어떤 스크린이 `src/screens/PostScreen/index.tsx`파일이 있고 컨테이너와 프레젠터로 구성하는 프로젝트인 경우, 해당 스크린의 입구가 되는 `index.tsx`에서 리덕스의 `dispatcher`나 `state`를 `props`로 전달하는 방식이다.

## react-redux의 Hooks

`react-redux`의 Hooks는 [공식 홈페이지](https://react-redux.js.org/api/hooks)에서도 소개하고 있는 부분이 몇 개 없어서 좋았다.

- `useSelector()`
- `useDispatch()`
- `useStore()`

위 세 가지만 공식적으로 있는 상태이다. 하나씩 확인 해보자.

### useSelector

`useSelector`는 리덕스 스토어의 `state`에 접근할 수 있게 해준다.

공식 홈페이지에 소개된 바로는 아래와 같다.

```tsx
const result : any = useSelector(selector : Function, equalityFn? : Function)
```

먼저 `selector`는 `mapStateToProps`를 `connect`에 넣는 것과 개념적으로 동일하다. `selector`는 리덕스 스토어 전체를 유일한 인자값으로 받고 함수 내부에서 이 인자값을 토대로 필요한 `state`만 골라 리턴하면 된다. 아주 간단한 동작 방식.

```tsx
// 코드 작성 전 상상의 코딩... 이렇게 하면 되겠지?
const { postList } = useSelector(store => store.post.postList);
```

`selector`는 컴포넌트가 렌더링 될 때 호출된다. 그리고 `useSelector`는 리덕스의 `store`를 `subscribe` 하는 구조이기 때문에 `action`이 `dispatch`되면 마찬가지로 `selector`를 돌린다.

하지만 `mapStateToProps`를 사용하는 것과는 차이가 있다고 하는데 차이점이 아래와 같다.

- 리턴 값으로 객체가 아니라 어떤 값이든 넘길 수 있음.
- `action`이 `dispatch` 되면 이전 결과와 얕은 비교를 한다. 다르다면 무조건 re-render를 하게 된다.
- `ownProps`를 인자로 받지 않는다. (다만 `closure` 형태로 만들 수는 있음)
- `memoizing selector`를 사용할 때 더 신경 써야 한다.
- 기본적으로 `===` 비교를 통해 동일성을 체크한다.

동등함 비교에 대한 얘기가 많고 이 부분을 주의해야 하는 것 같은데 예를 들어서 결과가 객체 형태라면, `selector` 결과 값이 항상 다르다고 판단할 거고, 성능면에서 좋지 못한 결과를 줄 것이라고 생각된다.

그리고 함수가 처음 렌더링 될 때는 `selector`가 무조건 호출 되지만, `action`이 `store`에 `dispatch`될 때는 그 결과가 현재 `selector`가 호출한 결과와 다른 경우에만 re-render 된다. 그 비교 연산자로 `===`를 사용하고 있다는 것이고, 반면 `connect`의 경우에는 `==`를 사용하고 있다는 것 같다. (다만, `connect`는 반환되는 객체가 새로운 객체인지 판단하지 않고 각 필드를 비교하기 때문에, 항상 re-render 되지는 않는다. - 반면 위에서 말한대로 별다른 옵션이 없다면 `useSelector`가 객체를 리턴하는 경우 항상 새로운 객체로 판단할 것이고, 그런 경우 객체의 필드값이 같더라도 무조건 re-render 된다.)

위와 같은 이유로, 만약 여러 값을 `useSelector`를 통해서 스토어에서 값을 가져와야 한다면, 아래와 같은 방법을 생각할 수 있다.

- 단일 필드를 리턴하는 `useSelector`를 여러번 사용한다.
- `Reselect`, 또는 복수의 값을 하나의 객체로 리턴해주는 `memoized selector` 라이브러리를 사용 (값이 진짜 바뀌는 경우에만 새로운 객체를 반환하는 형태의 라이브러리)
- `react-redux`의 `shallowEqual` 함수를 `equalityFn` 자리의 인자값으로 사용한다.

사실 세 번째 얘기를 할려고 앞에 두 가지 방법을 던져 둔 것 같다. 비교와 관련한 이슈가 많이 있어서, 어떻게 비교할 건지 정의하는 함수 자리가 있는 것 같은데, 이 부분에 `react-redux`에서 제공하는 `shallowEqual` 함수가 있다고 알려주고 있는 것이다. 문서가 말하는 대로라면, `shallowEqual`을 사용하면 객체를 리턴하는 경우의 성능상의 이슈를 최소화 할 수 있다고 생각된다. 제공해주는 예시는 다음과 같다.

```tsx
import { shallowEqual, useSelector } from "react-redux";

// later
const selectedData = useSelector(selectorReturningObject, shallowEqual);
```

### useDispatch

`dispatch` 함수의 참조를 리턴하는 hooks이다.

```tsx
const dispatch = useDispatch();
```

이 부분은 그냥 `connect`에서 `mapDispatchToState`를 만들었던 것과 동일하게 그냥 `dispatch`를 사용하면 된다. 예시는 아래 실제 데모를 만드는 과정에서 볼 수 있다.

### useStore

`Provider`를 통해서 들어온 리덕스의 `store`의 참조를 전달해준다. 자주 사용되는 걸 추천하지 않고 `useSelector`를 이용하는 걸 추천하고 있다.

---

hooks 내용은 사실상 이 정도에서 끝난다. `connect`를 대체하지 않는 게 더 좋을 것 같다는 생각은 일단 들긴 하는데 데모 앱을 구성해보자.

## Hooks로 기존 데모 앱 바꾸기

우선 리덕스를 붙이기 전 상태처럼 `src/screens/PostScreen/index.tsx`를 간단하게 바꿨다.

```tsx
export default PostScreen;
```

다음 간단하게 `useDispatch`와 `useSelector`를 사용해서 리덕스 스토어에서 값을 가져와 봤다.

```tsx
import React, { useEffect } from "react";
import Presenter from "./Presenter";
import { useDispatch, useSelector } from "react-redux";
import { getPost } from "../../redux/modules/post/sagaReducer";

const PostScreen: React.FC = props => {
  const dispatch = useDispatch();
  const postList = useSelector<any>(
    store => store.post.postList,
    (left, right): any =>
      (left as Array<any>).every((value, index) => {
        const sameTitle = value.title === (right as Array<any>)[index].title;
        const sameBody = value.body === (right as Array<any>)[index].body;
        return sameTitle && sameBody;
      })
  ) as Array<any>;

  const fetchPost = (): any => dispatch(getPost());

  useEffect(() => {
    // 렌더링이 얼마나 되는지 확인용
    console.log("rendering!!!!");
  });

  const onClick = () => {
    fetchPost();
  };

  return <Presenter onClick={onClick} postList={postList} />;
};

export default PostScreen;
```

`shallowEqual`을 사용해도 내부적으로 한 번 더 객체 형태라 같은 값을 가져와도 랜더링이 한 번 더 되는 것 같아서, 직접 비교하는 함수를 구성해봤다.

```tsx
const postList = useSelector<any>(
  store => store.post.postList,
  (left, right): any =>
    (left as Array<any>).every((value, index) => {
      const sameTitle = value.title === (right as Array<any>)[index].title;
      const sameBody = value.body === (right as Array<any>)[index].body;
      return sameTitle && sameBody;
    })
) as Array<any>;
```

복잡하기는 한데, `equalityFn`은 이전 상태를 `left`에, 다음 상태를 `right`로 둔다 (왜 타입 이름을 이렇게 했을까, prevState, nextState로 했으면 좋겠다 물론 그냥 내가 적을 때 그렇게 하면 되지만, 일단 데모에서는 타입에서 제공하는 이름으로 적었다). 넘어오는 값이 객체 형태로 깊다면, 이런식으로 직접 비교하는 함수를 작성해줘야 랜더링이 두 번 안 된다.

![](./render.png)

## 후기

Hooks 형태로 작성한다는 점 자체는 상당히 매력적인 것 같다. 그리고 비교 함수를 직접 넣을 수 있다는 점, `Container`에 로직을 넣는 방식이라는 점, `props interface`에 대해서 고민하지 않아도 된다는 점, (데모에서는 항상 any를 애용하지만, 실제 타입스크립트 프로젝트에서는 타입에 대해서 자주 고민하게 된다.) 등은 매력적인 것 같다. 다만 hooks 형태로 하게 되면, `Container`가 지나치게 복잡해지진 않을까 싶기도 하고, 협업할 때 특별한 패턴이나 아키텍처가 아니라서, 리덕스와 관련된 디버깅을 할 때 조금 더 시간 소비가 될 수 있지 않을까 싶기도 하다.

## Reference

- https://react-redux.js.org/api/hooks
