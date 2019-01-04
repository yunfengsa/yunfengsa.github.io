import { observable, action, runInAction } from "mobx";
import fetchJsonp from 'fetch-jsonp';
export default class ContentState {
  @observable src = '';
  @observable infoList = [];
  @observable reactList = [];
  @action
  getList() {
    this.fetchInfo();
    this.fetchReact();
  }
  @action
  fetchInfo() {
    fetchJsonp('http://47.110.48.184:3000/getinfo').then(res => {
      res.json().then(list => {
        runInAction(() => {
          this.infoList = list;
        })
      })
    }, err => {
      console.log(err)
    })
  }
  @action
  fetchReact() {
    fetchJsonp('http://47.110.48.184:3000/getoverreact').then(res => {
      res.json().then(list => {
        runInAction(() => {
          this.reactList = list;
        })
      })
    }, err => {
      console.log(err)
    })
  }
  @action.bound
  showIframe(src) {
    console.log(src)
    this.src = src;
  }
  @action.bound
  closeIframe() {
    this.src = '';
  }
}