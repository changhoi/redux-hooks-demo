import React, { useEffect } from "react";
import Presenter from "./Presenter";
import { useDispatch, useSelector } from "react-redux";
import { getPost } from "../../redux/modules/post/sagaReducer";

interface IProps {
  getPost: Function;
  postList: Array<any>;
}

const PostScreen: React.FC = props => {
  //  const { postList, getPost } = props as IProps;

  // const getPost = async () => {
  //   const { data: postList } = await Axios.get(ENDPOINTS.GET_POSTS, {
  //     baseURL: ENDPOINTS.BASE_URL
  //   });
  //   setPostList(postList);
  // };

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
    console.log("rendering!!!!");
  });

  const onClick = () => {
    fetchPost();
  };

  return <Presenter onClick={onClick} postList={postList} />;
};

export default PostScreen;
