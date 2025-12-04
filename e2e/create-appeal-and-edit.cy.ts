describe('создание и редактирование обращения', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });
// 
  // https://allure.itlabs.io/project/28/test-cases/5636?treeId=58
  it('#5636 Создание обращение клиента, который не зарегистрирован в ПЛ, но обращался на линию', () => {
    cy.createAppeal({ auth: { type: 'phone', value: '9199593297' } });
    // прогрузилась карточка клиента
    cy.contains('h2', 'Общая информация');
    // история обращений есть
    cy.get('div').invoke('hasClass', '.groupContainer');
  });

  // https://allure.itlabs.io/project/28/test-cases/4344?treeId=58
  it('#4344 Переходы из одной причины обращения в другую', () => {
    cy.createAppeal({ auth: { type: 'phone', value: '9199593297' } });
    // Находим причину обращения и открывает селект
    cy.get('[data-test=select-appeal]').click();
    // Выбираем 'Консультация Материалы / Услуги'
    cy.contains('Консультация Материалы / Услуги').click();
    // Нажимаем на список магазинов
    cy.get('.ant-select-selection-overflow-item')?.first()?.click();
    // Выбираем первый магазин
    cy.get('.ant-select-item-option').first().click({ force: true });
    // Включаем скрыть нулевые остатки
    cy.get('[data-test=remain-switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    // Пишем в поисковый инпут текст
    cy.get('[data-test=search-input]').type('d');
    // Кликаем на кнопку поиска
    cy.get('[data-test=search-button]').click();
    // Открываем модалку быстрого добавления у первого товара из списка
    cy.get('[data-test=shopping-card-button]')?.first()?.click();
    // Добавили товар в корзину
    cy.get('.ant-btn-primary').contains('Добавить').click();
    // Перешли в корзину
    cy.get('[data-test=to-cart-button]').click();
    // Нажали кнопку создать заказ
    cy.contains('div', 'Создать заказ').click();
    // Нажали на выбор обращений
    cy.contains('Консультация Материалы / Услуги').click();
    // Изменили обращение
    cy.contains('Новый заказ').click();
    // Перешли в историю клиента
    cy.get('[data-test=go-appeal-history]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/5500?treeId=58
  it('#5500 Редактирование причины обращения в созданном ранее обращении в истории', () => {
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    // Нажимаем на выбор причины обращения
    cy.get('[data-test=select-appeal]').click();
    // Выбираем 'Претензия'
    cy.contains('Претензия').click();
    // Перешли в историю клиента
    cy.get('[data-test=go-appeal-history]').click();
    // Находим первый элемент и проверяем что кнопки редактировании у него нет
    cy.get('[class^="_wrapper_"]')
      .first()
      .find('.anticon-edit')
      .should('not.exist');
    // Закрываем обращение и создаём заново
    cy.wait(1500);
    cy.visit('/');
    cy.createAppeal({ auth: { type: 'phone', value: '9000000022' } });
    // Последнее обращение с причиной Не указано
    cy.get('[class^="_wrapper_"]')
      .first()
      .get('[class^="_reasonsContainer_"]')
      .should('contain', 'Не указано');

    cy.get('[class^="_wrapper_"]')
      .eq(1)
      .find('.ant-row .ant-col')
      .find('[class^="_title_"]');
    // Строчка ниже с причиной Претензия
    cy.get('[class^="_wrapper_"]')
      .eq(2)
      .find('.ant-row .ant-col')
      .find('[class*="_text_"]')
      .find('[class*="_reasonsContainer_"]')
      .find('[class*="_reasonName_"]')
      .should('contain.text', 'Претензия');
    // Меняем причину обращения
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Консультация Материалы / Услуги').click();
    cy.get("[data-test='go-appeal-history']")
      .first()
      .contains('Идёт загрузка')
      .should('not.exist');
    cy.get('[data-test=go-appeal-history]').click();
    // Скролим до предыдущего дня
    cy.get('[class^="_groupContainer_"]')
      .eq(1)
      .scrollIntoView()
      .should('be.visible');
    // Нет возможности редактировать заказы предыдущего дня
    cy.get('[class^="_groupContainer_"]')
      .eq(1)
      .within(() => {
        cy.get('[class^="_wrapper_"]')
          .find('.anticon-edit')
          .should('not.exist');
      });
  });
});
