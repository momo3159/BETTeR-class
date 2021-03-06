global.browser = require('webextension-polyfill');

const BASE = 'https://eclass.doshisha.ac.jp';
const REPORT = 'レポート';
const QUIZ = '一問一答';
const TEST = '試験';

const isNotTakingLecture = square => {
  const colAttr = square.getAttribute('class');
  return colAttr.indexOf('blank') > -1 || colAttr === 'schedule-table-class_order';
};

const isLectureNameFound = (lectures, lectureName) => {
  return lectureName in lectures;
};

export const withinDeadline = (date, deadline) => {
  // format: 2020/12/19 23:57
  const [ymd, t] = deadline.split(' ');
  const [y, m, d] = ymd.split('/');
  const [h, min] = t.split(':');
  const endDate = new Date(y, parseInt(m) - 1, d, h, min);

  return endDate - date > 0;
};

const isNotReportAndQuiz = category => {
  return category.indexOf(REPORT) === -1 && category.indexOf(QUIZ) === -1 && category.indexOf(TEST) === -1;
};

export const getLectures = timeTable => {
  if (timeTable == null) throw new Error('No Lectures in this year');
  const lectures = {};

  const tableRows = timeTable.children[1].children;
  for (const tableRow of tableRows) {
    const squares = tableRow.children;
    for (const square of squares) {
      if (isNotTakingLecture(square)) {
        continue;
      }

      const lectureName = square.children[0].children[0].innerHTML.substring(3).split(' ')[0];
      const url = square.children[0].children[0].getAttribute('href');

      // 複数コマの授業に対応（e.g 情報工学実験1）
      if (isLectureNameFound(lectures, lectureName)) {
        continue;
      }

      lectures[lectureName] = { url: BASE + url, homeworks: {} };
    }
  }

  return lectures;
};

const getTimeTable = () => {
  return document.getElementById('schedule-table');
};

const getPanels = () => {
  return document.getElementsByClassName('panel');
};

const getHomeWorksOfLecture = sessions => {
  const homeworks = {};

  for (const session of sessions) {
    const itemsOfSession = session.children[1].children;

    for (const item of itemsOfSession) {
      const contentInfo = item.children[0].children[0];
      const contentCategory = contentInfo.children[1].innerText;

      if (isNotReportAndQuiz(contentCategory)) {
        continue;
      }

      let title = contentInfo.children[0].children[0].innerText;
      if (title === 'New') {
        title = contentInfo.children[0].children[1].innerText;
      }

      const periodOfAvailable = contentInfo.children[2].children[1].innerText;
      const [, deadline] = periodOfAvailable.split(' - ');

      if (withinDeadline(new Date(), deadline)) {
        homeworks[title] = {
          deadline,
          isDone: false,
        };
      }
    }
  }

  return homeworks;
};

const getPrevBtn = () => {
  const prevBtn = document.querySelector('body > header > nav > div:nth-child(1) > div > div > a.hidden-xs.course-webclass');
  return prevBtn;
};

const STATE = {
  SCRAPE_TIMETABLE: 'SCRAPE_TIMETABLE',
  BEFORE_SCRAPE_LECTURE_PAGE: 'BEFORE_SCRAPE_LECTURE_PAGE',
  SCRAPE_LECTURE_PAGE: 'SCRAPE_LECTURE_PAGE',
  COMPLETE: 'COMPLETE',
  EXIT: 'EXIT',
};

class Scraper {
  async init() {
    const { state } = await browser.storage.local.get(['state']);

    if (state === STATE.BEFORE_SCRAPE_LECTURE_PAGE) {
      this.state = new BeforeParseLecturePageState();
    } else if (state === STATE.SCRAPE_LECTURE_PAGE) {
      this.state = new ParseLecturePageState();
    } else if (state === STATE.COMPLETE) {
      this.state = new CompleteState();
    } else if (state === STATE.SCRAPE_TIMETABLE) {
      this.state = new TimeTableState();
    } else if (state === STATE.EXIT) {
      this.state = STATE.EXIT;
    } else {
      this.state = STATE.EXIT;
    }
  }

  async scrapeInformation() {
    await this.state.scrapeInformation();
  }

  async saveOnLocalStorage() {
    await this.state.saveOnLocalStorage();
  }

  async stateTransition() {
    await this.state.stateTransition();
  }

  async pageTransition() {
    await this.state.pageTransition();
  }

  isNotAllowedToWork() {
    return this.state === STATE.EXIT;
  }
}

class TimeTableState {
  async scrapeInformation() {
    const timeTable = getTimeTable();
    const lectures = getLectures(timeTable);
    const { lectures: oldLectures } = await browser.storage.local.get('lectures');

    await browser.storage.local.set({
      lectures,
      oldLectures,
      lectureNames: Object.keys(lectures),
      oldLectureNames: Object.keys(oldLectures),
      lectureCount: Object.keys(lectures).length,
    });
  }

  async stateTransition() {
    await browser.storage.local.set({ state: STATE.BEFORE_SCRAPE_LECTURE_PAGE });
  }

  async pageTransition() {
    location.reload();
  }
}

class BeforeParseLecturePageState {
  async scrapeInformation() {
    // 何もしない
  }

  async stateTransition() {
    await browser.storage.local.set({
      state: STATE.SCRAPE_LECTURE_PAGE,
    });
  }

  async pageTransition() {
    const { lectures, lectureNames, lectureCount } = await browser.storage.local.get(['lectures', 'lectureNames', 'lectureCount']);
    const lectureName = lectureNames.pop();

    await browser.storage.local.set({
      lectureNames,
      lectureCount: lectureCount - 1,
    });

    window.location.href = lectures[lectureName].url;
  }
}

class ParseLecturePageState {
  async scrapeInformation() {
    const { lectures } = await browser.storage.local.get(['lectures']);
    const lectureName = document
      .getElementsByClassName('course-name')[0]
      .innerText.substring(1)
      .split(' ')[0];

    const panels = getPanels();
    const homeworks = getHomeWorksOfLecture(panels);
    lectures[lectureName].homeworks = homeworks;

    await browser.storage.local.set({ lectures });
  }

  async stateTransition() {
    const { lectureCount } = await browser.storage.local.get(['lectureCount']);

    if (lectureCount > 0) {
      browser.storage.local.set({ state: STATE.BEFORE_SCRAPE_LECTURE_PAGE });
    } else {
      browser.storage.local.set({ state: STATE.COMPLETE });
    }
  }

  async pageTransition() {
    const prevBtn = getPrevBtn();
    prevBtn.click();
  }
}

class CompleteState {
  async scrapeInformation() {
    const { lectures, oldLectures } = await browser.storage.local.get(['lectures', 'oldLectures']);
    const lectureNames = Object.keys(lectures);

    lectureNames.forEach(name => {
      const titlesOfHomeworks = Object.keys(lectures[name].homeworks);
      if (Object.keys(oldLectures).includes(name)) {
        titlesOfHomeworks.forEach(title => {
          if (oldLectures[name].homeworks[title]) {
            lectures[name].homeworks[title].isDone = oldLectures[name].homeworks[title].isDone;
          }
        });
      }
    });
    await browser.storage.local.set({ lectures });
  }

  async stateTransition() {
    await browser.storage.local.set({ state: STATE.EXIT });
  }

  async pageTransition() {
    alert('課題一覧の取得が終了しました');
  }
}

const main = async () => {
  const scraper = new Scraper();
  await scraper.init();

  if (scraper.isNotAllowedToWork()) {
    await browser.storage.local.set({ state: '' });
    return;
  }

  await scraper.scrapeInformation();
  await scraper.stateTransition();
  await scraper.pageTransition();
};

main();
