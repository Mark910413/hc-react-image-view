
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './style.less';

const R = (2 * Math.PI) / 360;
class ImageView extends Component {
  constructor(props) {
    super(props);
    const {data = [], curIndex = 0} = props;
    this.ImgWrapDom = null;
    this.ImgToolDom = null;
    this.initEvent = new CustomEvent('init');
    this.ImgViewDom = React.createRef();

    this.imgWidth = 0;
    this.state = {
      scaleImg: 100,
      rotateImg: 0,
      data,
      curIndex,
      show: false,
      minWidth: 400,
      minHeight: 400,
    };
  }
  componentDidMount() {}
  componentWillReceiveProps() { }
  open({data = [], curIndex = 0}) {
    this.setState({
      show: true,
      data,
      curIndex,
    }, () => {
      this.init();
    });
  }
  // 初始化
  init = () => {
    // 拖拽数据准备
    this.ImgToolDom = this.ImgViewDom.querySelector('.tool-wrapper');
    this.ImgWrapDom = this.ImgViewDom.querySelector('.img-wrapper');
    this.ImgDom = this.ImgWrapDom.querySelector('.cur-img');
    this.ImgMask = this.ImgWrapDom.querySelector('.mask');

    this.scaleWindow(this.ImgViewDom);

    this.drage(this.ImgToolDom, this.ImgViewDom, true);
    this.drage(this.ImgWrapDom, this.ImgDom);

    this.imgWidth = this.ImgDom.clientWidth;
    this.scaleImg = 100;
  }
  /**
   * @description: 拖拽窗口
   * @param {dom} 触发拖拽的dom
   * @param {moveDom} 被拖拽的dom
   * @param {limit} 是否限制边界
   * @return {null}
   */
  drage = (dom, moveDom, limit = false) => {
    // 在图片区域鼠标是否被按下的标志
    // 鼠标点击时图片区域
    //  x，y坐标位置
    // offsetL, offsetT 窗口的偏移位置
    // 图片初始宽度
    let ImgWrapClickFlag = false;
    let clickX = 0;
    let clickY = 0;
    let top = 0;
    let left = 0;

    dom.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (this.ImgMask.style.cursor) { return false; }
      ImgWrapClickFlag = true;
      dom.style.cursor = 'move';
      top = window.getComputedStyle(moveDom).top;
      left = window.getComputedStyle(moveDom).left;
      clickX = e.pageX;
      clickY = e.pageY;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
    });

    dom.addEventListener('mouseup', end);
    document.addEventListener('mouseup', end);

    dom.addEventListener('init', () => {
      ImgWrapClickFlag = false;
      clickX = 0;
      clickY = 0;
      moveDom.style.left = 0;
      moveDom.style.top = 0;
      top = 0;
      left = 0;
    });

    function move(e) {
      if (!ImgWrapClickFlag) { return false; }
      const moveX = (e.clientX - clickX) + parseInt(left, 10);
      const moveY = (e.clientY - clickY) + parseInt(top, 10);
      const moveDomWidth = moveDom.clientWidth;
      const moveDomHeight = moveDom.clientHeight;
      const pageWidth = document.documentElement.clientWidth;
      const pageHeight = document.documentElement.clientHeight;
      if (limit) {
        if (moveDomWidth / 2 < moveX && ((moveX + (moveDomWidth / 2)) < pageWidth)) {
          moveDom.style.left = `${moveX}px`;
        }
        if (moveDomHeight / 2 < moveY && ((moveY + (moveDomHeight / 2)) < pageHeight)) {
          moveDom.style.top = `${moveY}px`;
        }
        return false;
      }
      moveDom.style.left = `${moveX}px`;
      moveDom.style.top = `${moveY}px`;
    }

    function end(e) {
      e.preventDefault();
      if (!ImgWrapClickFlag) { return false; }
      ImgWrapClickFlag = false;
      dom.style.cursor = 'default';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    }
  }
  /**
   * @description: 缩放图片
   * @param {dom}
   * @param {type}
   * @return {null}
   */
  scaleImgFn = (type = 'plus') => {
    let { scaleImg = 100} = this.state;
    if ((type === 'plus' && scaleImg >= 300) || (type === 'minus' && scaleImg <= 100)) { return false; }
    scaleImg += type === 'plus' ? 10 : -10;
    this.ImgDom.style.width = `${(scaleImg / 100) * this.imgWidth}px`;
    this.setState({scaleImg});
  }
  /**
   * @description: 旋转功能
   * @param {*}
   * @return {null}
   */
  rotate = () => {
    let { rotateImg } = this.state;
    rotateImg = (rotateImg + 90) % 360;
    this.ImgDom.style.webkitTransform = `matrix(${Math.cos(rotateImg * R)}, ${Math.sin(rotateImg * R)}, ${-1 * Math.sin(rotateImg * R)}, ${Math.cos(rotateImg * R)}, 0, 0)`;
    this.setState({rotateImg});
    this.ImgWrapDom.dispatchEvent(this.initEvent);
  }
  /**
   * @description: 缩放窗口
   * @param {dom} 窗口dom
   * @return {type}
   */
  scaleWindow = (dom) => {
    const { minHeight, minWidth } = this.state;
    const that = this;
    const scaleR = 20; // 拉伸区域半径
    let clickFlag = false;

    let pageX = 0;
    let pageY = 0;

    let winWidth = this.ImgViewDom.clientWidth;
    let winHeight = this.ImgMask.clientHeight;

    let top = 0;
    let left = 0;

    // 拉伸方式 0 不在拉伸状态 1 右边线拉伸 2 底部拉伸 3 左边线拉伸 4右下加拉伸 5左下角拉伸
    let way = 0;
    dom.addEventListener('mousemove', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;

      this.ImgMask.style.cursor = '';
      e.preventDefault();
      // 鼠标按下时 锁定拉伸状态
      if (clickFlag) { return false; }
      // 右边线 拉伸
      if (((winWidth - x < scaleR) && winHeight - y > scaleR)) {
        way = 1;
        this.ImgMask.style.cursor = 'col-resize';
      // 下边线 拉伸
      } else if (((winWidth - x > scaleR) && winHeight - y < scaleR && x > scaleR)) {
        way = 2;
        this.ImgMask.style.cursor = 'row-resize';
      // 左边线 拉伸
      } else if (((x < scaleR) && winHeight - y > scaleR)) {
        way = 3;
        this.ImgMask.style.cursor = 'col-resize';
      // 右下角 拉伸
      } else if (((winWidth - x <= scaleR) && (winHeight - y <= scaleR))) {
        way = 4;
        this.ImgMask.style.cursor = 'nw-resize';
      // 左下角 拉伸
      } else if (((x <= scaleR) && (winHeight - y <= scaleR))) {
        way = 5;
        this.ImgMask.style.cursor = 'sw-resize';
      } else if (y < scaleR) {
        way = 0;
      }
    });
    dom.addEventListener('mousedown', (e) => {
      if (way === 0) { return false; }
      if (!inScaleArea(e)) { return false; }
      clickFlag = true;
      pageX = e.pageX;
      pageY = e.pageY;
      top = window.getComputedStyle(dom).top;
      left = window.getComputedStyle(dom).left;
      document.addEventListener('mousemove', scaleFn);
      document.addEventListener('mouseup', end);
    });
    dom.addEventListener('mouseup', end);

    function scaleFn(evt) {
      const pX = evt.pageX;
      const pY = evt.pageY;
      let newWidth = 0;
      let newHeight = 0;
      if (!clickFlag) { return false; }

      if (way === 1) {
        newWidth = winWidth + (pX - pageX);
        if (newWidth < minWidth) { return false; }

        that.ImgViewDom.style.width = `${newWidth}px`;
        const moveX = ((pX - pageX) / 2) + parseInt(left, 10);
        dom.style.left = `${moveX}px`;
      } else if (way === 2) {
        newHeight = winHeight + (pY - pageY);
        if (newHeight < minHeight) { return false; }

        that.ImgWrapDom.style.height = `${newHeight}px`;
        const moveY = ((pY - pageY) / 2) + parseInt(top, 10);
        dom.style.top = `${moveY}px`;
      } else if (way === 3) {
        newWidth = winWidth - ((pX - pageX));
        if (newWidth < minWidth) { return false; }

        that.ImgViewDom.style.width = `${newWidth}px`;
        const moveX = ((pX - pageX) / 2) + parseInt(left, 10);
        dom.style.left = `${moveX}px`;
      } else if (way === 4) {
        newWidth = winWidth + (pX - pageX);
        newHeight = winHeight + (pY - pageY);

        if (newWidth >= minWidth) {
          that.ImgViewDom.style.width = `${newWidth}px`;
          const moveX = ((pX - pageX) / 2) + parseInt(left, 10);
          dom.style.left = `${moveX}px`;
        }

        if (newHeight >= minHeight) {
          that.ImgWrapDom.style.height = `${newHeight}px`;
          const moveY = ((pY - pageY) / 2) + parseInt(top, 10);
          dom.style.top = `${moveY}px`;
        }
      } else if (way === 5) {
        newWidth = winWidth - (pX - pageX);
        newHeight = winHeight + (pY - pageY);

        if (newWidth >= minWidth) {
          that.ImgViewDom.style.width = `${newWidth}px`;
          const moveX = ((pX - pageX) / 2) + parseInt(left, 10);
          dom.style.left = `${moveX}px`;
        }

        if (newHeight >= minHeight) {
          that.ImgWrapDom.style.height = `${newHeight}px`;
          const moveY = ((pY - pageY) / 2) + parseInt(top, 10);
          dom.style.top = `${moveY}px`;
        }
      }
      return false;
    }

    function inScaleArea(e) {
      let inAarea = 0;
      const x = e.offsetX;
      const y = e.offsetY;
      e.preventDefault();
      // 右边线 拉伸
      if (((winWidth - x < scaleR) && winHeight - y > scaleR)) {
        inAarea = 1;
      // 下边线 拉伸
      } else if (((winWidth - x > scaleR) && winHeight - y < scaleR) && x > scaleR) {
        inAarea = 2;
      // 左边线 拉伸
      } else if (((x < scaleR) && winHeight - y > scaleR)) {
        inAarea = 3;
      } else if (((winWidth - x <= scaleR) && (winHeight - y < scaleR))) {
        inAarea = 4;
      } else if (((x <= scaleR) && (winHeight - y < scaleR))) {
        inAarea = 5;
      } else if (y < scaleR) {
        inAarea = 0;
      }
      return inAarea;
    }

    function end() {
      winWidth = that.ImgViewDom.clientWidth;
      winHeight = that.ImgMask.clientHeight;
      clickFlag = false;
      way = 0;
      document.removeEventListener('mousemove', scaleFn);
      document.removeEventListener('mouseup', end);
    }
  }

  change = (type = 'pre') => {
    let { curIndex = 0 } = this.state;
    const { data } = this.state;
    const rotateImg = 0;
    const scaleImg = 100;
    if (curIndex === 0 && type === 'pre') {
      curIndex = data.length - 1;
    } else if (curIndex === (data.length - 1) && type === 'next') {
      curIndex = 0;
    } else {
      curIndex += type === 'next' ? 1 : -1;
    }
    this.setState({curIndex, rotateImg, scaleImg});
    this.ImgDom.style.width = `${(scaleImg / 100) * this.imgWidth}px`;
    this.ImgWrapDom.dispatchEvent(this.initEvent);
    this.ImgDom.style.webkitTransform = `matrix(${Math.cos(rotateImg * R)}, ${Math.sin(rotateImg * R)}, ${-1 * Math.sin(rotateImg * R)}, ${Math.cos(rotateImg * R)}, 0, 0)`;
  }
  close = () => {
    this.setState({show: false});
    this.destroy();
  }

  destroy = () => {
    this.ImgWrapDom = null;
    this.ImgToolDom = null;
    this.ImgViewDom = null;
  }
  scrollImg = (e) => {
    // eslint-disable-next-line react/no-find-dom-node
    const ele = ReactDOM.findDOMNode(this);
    if (e.nativeEvent.deltaY <= 0 && ele.scrollTop <= 0) {
      /* scrolling up */
      this.scaleImgFn('plus');
      /* scrolling down */
    } else if (ele.scrollTop + ele.clientHeight >= ele.scrollHeight) {
      this.scaleImgFn('minus');
    }
  }
  // 防抖
  debounce = (fn, wait) => {
    let timer = null;
    return (...args) => {
      if (timer) { return false; }
      fn.apply(this, args);
      timer = setTimeout(() => { timer = null; }, wait);
    };
  }

  scrollImgDebounce = this.debounce(this.scrollImg, 20).bind(this)

  render() {
    const { scaleImg = 100, data, curIndex, show} = this.state;
    return (
      show ?
        <div
          className="iamge-view-modal-wrapper"
          ref={(e) => { this.ImgViewDom = e; }}
          style={{
            transform: 'translate(0, 0, 0)',
          }}
        >
          <div className="tool-wrapper">
            <div className="left">
              <img src="./public/assets/reverse.png" alt="" onClick={(e) => { e.preventDefault(); this.rotate(); }} className="rotate" />
              <img src="./public/assets/plus.png" alt="" onClick={(e) => { e.preventDefault(); this.scaleImgFn('plus'); }} className={scaleImg < 300 ? '' : 'disabled'} />
              <img src="./public/assets/minus.png" alt="" onClick={(e) => { e.preventDefault(); this.scaleImgFn('minus'); }} className={scaleImg > 100 ? '' : 'disabled'} />
            </div>
            <div className="right">
              <img src="./public/assets/pre.png" className="pre" alt="" onClick={(e) => { e.preventDefault(); this.change('pre'); }} />
              <img src="./public/assets/next.png" className="next" alt="" onClick={(e) => { e.preventDefault(); this.change('next'); }} />
              <img src="./public/assets/close.png" className="close" alt="" onClick={(e) => { e.preventDefault(); this.close(); }} />
            </div>
          </div>
          <div className="img-wrapper">
            <div className="mask" onWheel={this.scrollImgDebounce} />
            <img className="cur-img" src={data[curIndex]} alt="" />
          </div>
        </div> : null
    );
  }
}

const ele = document.createElement('div');
document.body.appendChild(ele);
// eslint-disable-next-line react/no-render-return-value
const imgView = ReactDOM.render(<ImageView />, ele);

export default imgView;
