import React from 'react';
import { render} from 'react-dom';
import ImgView from '../src/Index.jsx';
import './style.less';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgList: ['./public/exmple_img/img1.jpg', './public/exmple_img/img2.jpg', './public/exmple_img/img3.jpg']
    }
  }
  componentWillUnmount() {
    ImgView.close();
  }
  openImgView = (index) => {
    const { imgList = [] } = this.state;
    console.log({data: imgList, curIndex: index});
    ImgView.open({data: imgList, curIndex: index});
  }
  render() {
    const { imgList } = this.state;
    return (
      <div className="img-list">
        {
          imgList.map((item, index) => {
            return <img src={item} key={index} onClick={ () => { this.openImgView(index);} } />;
          })
        }
      </div>
    );
  }
}
render(<App />, document.getElementById("root"));