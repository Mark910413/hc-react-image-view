<p align="middle" ><img src="https://raw.githubusercontent.com/Mark910413/hc-react-image-view/master/exmple.jpg"/></p>
<h2 align="middle">Hc React Image-view</h2>

## Installation

## 🚀 How to use
```javascript
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

```
	
	
## ⭐️ Show Your Support
Please give a ⭐️ if this project helped you!
