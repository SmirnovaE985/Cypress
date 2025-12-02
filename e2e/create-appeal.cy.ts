describe('Создание обращения', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  // https://allure.itlabs.io/project/28/test-cases/4576?treeId=58
  it('#4576 Создание обращения - валидация (телефон)', () => {
    cy.stubWindowOpen();
    cy.contains('Клиенты').trigger('mouseover');
    cy.contains('Новое обращение').click({ force: true });
    cy.contains('label', 'Телефон').click();

    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный номер телефона');

    cy.get('input[name="phone"]').clear().type('1111111111');
    cy.get('button[type="submit"]').click();
    cy.contains('Неверный формат телефонного номера');

    cy.get('input[name="phone"]').clear().type('919959');
    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный номер телефона');

    cy.get('input[name="phone"]').type('9199593292');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/selectClient');
    cy.contains('Создание клиента').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/4576?treeId=58
  it('#4576 Создание обращения - валидация (email)', () => {
    cy.stubWindowOpen();
    cy.contains('Клиенты').trigger('mouseover');
    cy.contains('Новое обращение').click({ force: true });
    cy.contains('label', 'E-mail').click();

    cy.get('button[type="submit"]').click();
    cy.contains('Это обязательное поле');

    cy.get('input[name="email"]')
      .clear()
      .type('s'.repeat(50) + 'nikaniki02@mail.ru');
    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный email');

    cy.get('input[name="email"]').clear().type('grusha@@mail.ru');
    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный email');

    cy.get('input[name="email"]').clear().type('nikaniki02@mail.ru');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/selectClient');
    cy.contains('Создание клиента').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/4576?treeId=58
  it('#4576 Создание обращения - валидация (мессенджер)', () => {
    cy.stubWindowOpen();
    cy.contains('Клиенты').trigger('mouseover');
    cy.contains('Новое обращение').click({ force: true });
    cy.contains('label', 'Мессенджер').click();

    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный номер телефона');

    cy.get('input[name="messanger"]').clear().type('919959');
    cy.get('button[type="submit"]').click();
    cy.contains('Укажите корректный номер телефона');

    cy.get('input[name="messanger"]').type('9199570789');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/selectClient');
    cy.contains('Создание клиента').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/3232?treeId=58
  it('#3232 Создание обращения с причиной "Новый заказ"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.url().should('include', '/search');
    cy.contains('Введите поисковой запрос').should('exist');
    cy.contains('Укажите магазин').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Новый заказ');
  });

  // https://allure.itlabs.io/project/28/test-cases/3242?treeId=58
  it('#3242 Создание обращения с причиной "Редактирование заказа"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Редактирование заказа').click();
    cy.url().should('include', '/cart');
    cy.contains('Нет добавленных позиций').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Редактирование заказа');
  });

  // https://allure.itlabs.io/project/28/test-cases/3244?treeId=58
  it('#3244 Создание обращения с причиной "Консультация Материалы / Услуги"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Консультация Материалы / Услуги').click();
    cy.url().should('include', '/search');
    cy.contains('Введите поисковой запрос').should('exist');
    cy.contains('Укажите магазин').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения')
      .parent()
      .contains('Консультация Материалы / Услуги');
  });

  // https://allure.itlabs.io/project/28/test-cases/3245?treeId=58
  it('#3245 Создание обращения с причиной "Справка / Информация по заказу"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Справка / Информация по заказу').click();
    cy.url().should('include', '/searchOrder');
    cy.contains('Поиск заказа по номеру').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения')
      .parent()
      .contains('Справка / Информация по заказу');
  });

  // https://allure.itlabs.io/project/28/test-cases/3243?treeId=58
  it('#3243 Создание обращения с причиной "Ошибки / ОС"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Ошибки / ОС').click();
    cy.url().should('include', '/incident');
    cy.contains('Регистрация ошибки/ос').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Ошибки / ОС');
  });

  // https://allure.itlabs.io/project/28/test-cases/3246?treeId=58
  it('#3246 Создание обращения с причиной "Претензия"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Претензия').click();
    cy.url().should('include', '/complaint');
    cy.contains('Регистрация претензии').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Претензия');
  });

  // https://allure.itlabs.io/project/28/test-cases/3247?treeId=58
  it('#3247 Создание обращения с причиной "Соискатели"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Соискатели').click();
    cy.url().should('include', '/interview');
    cy.contains('Укажите вакансию').should('exist');
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Соискатели');
  });

  // https://allure.itlabs.io/project/28/test-cases/3248?treeId=58
  it('#3248 Создание обращения с причиной "Прокат"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Прокат').click();
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Прокат');
  });

  // https://allure.itlabs.io/project/28/test-cases/3249?treeId=58
  it('#3249 Создание обращения с причиной "Водители/ЛТС/ЦТС"', () => {
    cy.createAppeal();
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Водители/ЛТС/ЦТС').click();
    cy.wait(1000);
    cy.visit('/home/appeal-history');
    cy.contains('Причина обращения').parent().contains('Водители/ЛТС/ЦТС');
  });

  //https://allure.itlabs.io/project/28/test-cases/5352?treeId=58
  it('#5352 Процесс создания обращения клиента, с сегментом "Мастер"', () => {
    cy.stubWindowOpen();
    cy.contains('Клиенты').trigger('mouseover');
    cy.contains('Новое обращение').click({ force: true });
    cy.get('input[name="phone"]').type('9000000055');
    cy.get('button[type="submit"]').click();
    cy.get('button[data-test="select-client"]').first().click();
    cy.get('[data-test="client-promo-status"]').each((status) =>
      expect(status).have.text('Мастер'),
    );
  });

  //https://allure.itlabs.io/project/28/test-cases/5264?treeId=58
  it('#5264 Создание нового клиента, который уже обращался на линию с сегментом мастер"', () => {
    cy.stubWindowOpen();
    cy.contains('Клиенты').trigger('mouseover');
    cy.contains('Новое обращение').click({ force: true });
    cy.get('input[name="phone"]').type('9000000055');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="button"]').click();
    cy.get('input[type="search"]').click();
    cy.contains('div', 'Физическое лицо').click();
    cy.get('input[type="text"]').type('Ivan');
    cy.get('button[type="submit"]').click();
    cy.get('[data-test="client-promo-status"]').each((status) =>
      expect(status).have.text('Мастер'),
    );
  });
});
