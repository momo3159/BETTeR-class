global.browser = require('webextension-polyfill');

// インストールした時に実行
browser.runtime.onInstalled.addListener(function() {
  /**
   * canParsed: popupのボタンで起動したかどうか
   * alreadyParsed: すでに時間割を取得しているか
   * lectures: 履修講義一覧
   * lectureCount: 履修講義数
   * homeworks: 課題一覧
   *
   */
  browser.storage.local.set({
    state: '',
    lectures: {},
    oldLectures: {},
    lectureNames: [],
    lectureCount: 0,
  });
});

// 起動時に実行

// browser.browserAction.onClicked.addListener(function(tab) {
//     console.log("hogehogehogheohgoeghoe")
//     browser.storage.local.get(['homeworks']).then((item)=> {
//         console.log(item)
//     })

// });

// browser.browserAction.setPopup({popup: './popup/popup.html'})
