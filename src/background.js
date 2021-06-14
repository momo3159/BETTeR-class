global.browser = require('webextension-polyfill');

browser.runtime.onInstalled.addListener(function() {
  /**
   * state: 時間割の解析 or 課題情報の解析 or 終了かを表す
   * lectures: 履修している講義およびその情報の一覧
   * oldLectures: 新たに情報を取得する際に、現在の情報を格納しておくプロパティ
   * lectureCount: 履修講義数
   */
  browser.storage.local.set({
    state: '',
    lectures: {},
    oldLectures: {},
    lectureNames: [],
    lectureCount: 0,
  });
});
