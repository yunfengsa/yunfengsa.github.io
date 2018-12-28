import { observable, action, runInAction } from "mobx";
import fetchJsonp from 'fetch-jsonp';
export default class ContentState {
  @observable infoList = [];
  @action
  fetchInfo() {
    fetchJsonp('http://47.110.48.184:3000/getinfo').then(res => { //http://47.110.48.184:3000/getinfo
      res.json().then(list => {
        console.log(list)
        runInAction(() => {
          this.infoList = list;
        })
      })
    }, err => {
      console.log(err)
    })
  }
}