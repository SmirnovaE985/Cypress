// #4587 Привязка клиента к менеджеру через вкладку "мои клиенты"
// #4592 Создание претензии
// #4964 Регистрация Ошибки/ОС
// #4594 Регистрация соискателя [WIP]

describe('Разные причины обращения, привязка клиента, создания претензии', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  // https://allure.itlabs.io/project/28/test-cases/4587?treeId=58
  it('#4587 Привязка клиента к менеджеру через вкладку "мои клиенты"', () => {
    cy.contains('Клиенты').trigger('mouseover', { force: true });
    cy.contains('Мои клиенты').click({ force: true });
    cy.contains('span', 'Добавить нового клиента ').click({ force: true });
    const name =
      'Иван' +
      `${Math.floor(Math.random() * 10)}` +
      `${Math.floor(Math.random() * 10)}` +
      `${Math.floor(Math.random() * 10)}`;
    const phone =
      '9123321' +
      `${Math.floor(Math.random() * 10)}` +
      `${Math.floor(Math.random() * 10)}` +
      `${Math.floor(Math.random() * 10)}`;

    cy.get('input[placeholder="Укажите имя"]').type(name);
    cy.get('input[placeholder="Номер телефона"]').type(phone);
    cy.contains('span', 'Создать нового клиента').click({ force: true });
    cy.contains('Клиент создан успешно').should('exist');
    cy.contains('div', name);
    cy.contains('div', phone);
    cy.visit('/', {
      onBeforeLoad: (win) => win.sessionStorage.clear(),
    });
    cy.createAppeal({
      auth: { type: 'phone', value: phone },
      options: { name },
    });

    cy.get('[data-icon="edit"]').click();
    cy.contains('Физическое лицо').click();
    cy.contains('Юридическое лицо').click();
    cy.get('button[type="submit"]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/4592?treeId=58
  it('#4592 Создание претензии', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    cy.addPositionToCart({ text: 'кисть' });
    cy.get('[data-test=to-cart-button]').click();
    cy.contains('div', 'Создать заказ').click();
    cy.contains('Заказ №')
      .invoke('text')
      .then((text) => {
        const orderNumber = text.match(/\d+/)[0];

        cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
        cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
        cy.get('[data-test=select-appeal]').click();
        cy.contains('Претензия').click();

        cy.get('input[name="orderNumber"]').type(orderNumber);
        cy.get('input[name="phone"]').should('have.value', '+79000000022');
        cy.contains('Выбрать источник претензии').click({ force: true });
        cy.contains('Контакт-центр').click();
        cy.contains('Выбрать инцидент').click({ force: true });
        cy.contains('Самовывоз').click();
        cy.get('#rc_select_3').click({ force: true });
        cy.contains('СД Ялуторовск').click();
        cy.contains('Выбрать канал сбыта').click({ force: true });
        cy.contains('Розница').click();
        cy.contains('Выбрать подразделение').click({ force: true });
        cy.contains('Интернет-магазин').click();
        cy.contains('Выберите подразделение и ответственных').should(
          'not.exist',
        );
        cy.contains('Выбрать что произошло').click({ force: true });
        cy.contains('Грубость').click();
        cy.get('textarea[name="comment"]').type('Тестовый комментарий');
        cy.contains('Отправить претензию').click();
        cy.contains('Претензия успешно создана').should('exist');
        cy.contains('Успешно зарегистрирована').should('exist');
        cy.contains('Претензия №').should('exist');
      });
  });

  // https://allure.itlabs.io/project/28/test-cases/4964?treeId=58
  it('#4964 Регистрация Ошибки/ОС', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    cy.addPositionToCart({ text: 'кисть' });
    cy.get('[data-test=to-cart-button]').click();
    cy.contains('div', 'Создать заказ').click();
    cy.contains('Заказ №')
      .invoke('text')
      .then((text) => {
        const orderNumber = text.match(/\d+/)[0];

        cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
        cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
        cy.get('[data-test=select-appeal]').click();
        cy.contains('Ошибки / ОС').click();
        cy.get('input[name="phone"]').should('have.value', '+79000000022');
        cy.get('input[name="orderNumber"]').type(orderNumber);
        cy.get('#rc_select_1').click({ force: true });
        cy.get('div[title="РЦ Тмн, 50 лет Октября, 109 ко"]')
          .first()
          .click({ force: true });
        cy.get('.ant-layout-content').first().click({ force: true });
        cy.get('#rc_select_2').click();
        cy.contains('Водитель').click();
        cy.get('textarea[name="comment"]').type('Тестовый комментарий');
        cy.contains('Зарегистрировать ошибку').click();
        cy.contains('Ошибка успешно зарегистрирована').should('exist');
      });
  });

  // https://allure.itlabs.io/project/28/test-cases/4594?treeId=58
  it('#4594 Регистрация соискателя', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Соискатели').click();
    cy.get('input[name="phone"]').should('have.value', '+79000000022');
    cy.contains('span', 'Укажите населенный пункт').click({ force: true });
    cy.get('span[title="Тюмень"]').last().click();
    cy.contains('span', 'Укажите вакансию').click({ force: true });
    cy.contains('Водитель без авто').click({ force: true });
    // WIP Текущая API не работает для вакансий
    cy.get('input[name="lastName"]').type('Иванов');
    cy.get('input[name="firstName"]').type('Иван');
    cy.get('input[name="middleName"]').type('Иванович');
    cy.contains('span', 'Записать в таблицу').click().wait(4000);
    cy.contains('Информация отправлена в гугл-таблицу').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/4594?treeId=58
  it('#4594 Регистрация соискателя', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Соискатели').click();
    cy.get('input[name="phone"]').should('have.value', '+79000000022');
    cy.contains('span', 'Укажите населенный пункт').click({ force: true });
    cy.get('span[title="Тюмень"]').last().click();
    cy.contains('span', 'Укажите вакансию').click({ force: true });
    cy.contains('Другая вакансия').click({ force: true });
    cy.get('input[name="otherVacancy"]').type('Менеджер');
    // WIP Текущая API не работает для вакансий
    cy.get('input[name="lastName"]').type('Иванов');
    cy.get('input[name="firstName"]').type('Иван');
    cy.get('input[name="middleName"]').type('Иванович');
    cy.contains('span', 'Записать в таблицу').click().wait(4000);
    cy.contains('Информация отправлена в гугл-таблицу').should('exist');
    // cy.visit(
    //  'https://docs.google.com/spreadsheets/d/187Ji7XfZWDwdAcVXpsGyCkjhs4N9Yo2hYXlvHzOmzXA/edit?gid=0#gid=0',
  });

  // https://allure.itlabs.io/project/28/test-cases/4594?treeId=58
  it('#4594 Регистрация соискателя', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Соискатели').click();
    cy.get('input[name="phone"]').should('have.value', '+79000000022');
    cy.contains('span', 'Укажите населенный пункт').click({ force: true });
    cy.get('span[title="Тюмень"]').last().click();
    cy.contains('span', 'Укажите вакансию').click({ force: true });
    cy.contains('Водитель с авто').click({ force: true });
    // WIP Текущая API не работает для вакансий
    cy.get('input[name="lastName"]').type('Иванов');
    cy.get('input[name="firstName"]').type('Иван');
    cy.get('input[name="middleName"]').type('Иванович');
    cy.contains('Авто: 5 т').click();
    cy.contains('Авто: 20 т').click();
    cy.contains('Курьер: 1,5 т').click();
    cy.contains('span', 'Записать в таблицу').click().wait(4000);
    cy.contains('Информация отправлена в гугл-таблицу').should('exist');
  });
});
