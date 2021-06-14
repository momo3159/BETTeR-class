import { getLectures } from './content';

const _timeTable = `
<table class="schedule-table" id="schedule-table">
  <thead>
    <tr>
      <th class=""></th>
      <th height="30" nowrap="" class="">月曜日</th>
      <th height="30" nowrap="" class="active">火曜日</th>
      <th height="30" nowrap="" class="">水曜日</th>
      <th height="30" nowrap="" class="">木曜日</th>
      <th height="30" nowrap="" class="">金曜日</th>
      <th height="30" nowrap="" class="">土曜日</th>
    </tr>
  </thead>
  <tbody>
    <tr data-class_order="1">
      <td height="55" nowrap="" class="schedule-table-class_order">1限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td align="left" valign="top" class="">
        <div>
          <a
            href="/hoge"
            target="_top"
            >» △情報数学Ⅰ 000 (2018-秋学期-金曜日-1限)
            <div class="course-new-message">新着メッセージ(2)</div></a
          >
        </div>
      </td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="2">
      <td height="55" nowrap="" class="schedule-table-class_order">2限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td align="left" valign="top" class="">
        <div>
          <a
            href="/hoge"
            target="_top"
            >» △コンピュータ基礎実習 000 (2018-秋学期-金曜日-2限)
            <div class="course-new-message">新着メッセージ(10)</div></a
          >
        </div>
      </td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="3">
      <td height="55" nowrap="" class="schedule-table-class_order">3限</td>
      <td align="left" valign="top" class="">
        <div>
          <a
            href="/hoge"
            target="_top"
            >» △情報工学概論Ⅱ 000 (2018-秋学期-月曜日-3限)
            <div class="course-new-message">新着メッセージ(1)</div></a
          >
        </div>
      </td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="4">
      <td height="55" nowrap="" class="schedule-table-class_order">4限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td align="left" valign="top" class="">
        <div>
          <a
            href="/hoge"
            target="_top"
            >» △ＣプログラミングⅡ 000 (2018-秋学期-金曜日-4限-複数コマ)
            <div class="course-new-message">新着メッセージ(18)</div></a
          >
        </div>
      </td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="5">
      <td height="55" nowrap="" class="schedule-table-class_order">5限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td align="left" valign="top" class="">
        <div>
          <a
            href="/hoge"
            target="_top"
            >» △ＣプログラミングⅡ 000 (2018-秋学期-金曜日-4限-複数コマ)
            <div class="course-new-message">新着メッセージ(18)</div></a
          >
        </div>
      </td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="6">
      <td height="30" nowrap="" class="schedule-table-class_order">6限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
    </tr>
    <tr data-class_order="7">
      <td height="30" nowrap="" class="schedule-table-class_order">7限</td>
      <td class="blank"><br /></td>
      <td class="active-blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
      <td class="blank"><br /></td>
    </tr>
  </tbody>
</table>
`;
const stringToElement = str => {
  const el = document.createElement('div');
  el.innerHTML = str;
  return el.firstElementChild;
};

test('時間割のパース', () => {
  global.chrome = chrome;
  global.browser = browser;

  expect(getLectures(stringToElement(_timeTable))).toStrictEqual({
    コンピュータ基礎実習: { url: 'https://eclass.doshisha.ac.jp/hoge', homeworks: {} },
    情報工学概論Ⅱ: { url: 'https://eclass.doshisha.ac.jp/hoge', homeworks: {} },
    ＣプログラミングⅡ: { url: 'https://eclass.doshisha.ac.jp/hoge', homeworks: {} },
    情報数学Ⅰ: { url: 'https://eclass.doshisha.ac.jp/hoge', homeworks: {} },
  });
});
