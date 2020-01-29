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

## react-redux의 Hooks
