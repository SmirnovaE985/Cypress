// переписан в playwright
describe('Тесты с корзиной', () => {
  beforeEach(() => {
    cy.intercept('/search-analytics-api/**', { data: 'success ' });
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
    cy.createAppeal();
  });

  afterEach(() => {
    cy.get('[data-test=delete-all-position]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test=save-order], [data-test=save-offer]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/4609?treeId=58
  it('#4609 Перевод предложения в заказ', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('краска');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=make-offer]').click();
    cy.contains('Предложение успешно создано').should('exist');
    cy.contains('Предложение №').should('exist');

    cy.get('[data-test=offer-to-order]').click();

    cy.contains('Предложение переведено в заказ успешно!').should('exist');
    cy.contains('Заказ №').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/5301?treeId=58
  it('#5301 Создание нового заказа, после закрытия старого заказа и возврата в поиск', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });
    cy.get('[data-test=search-input]').type('краска');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');

    cy.get('[data-test=close-order-btn]').click();
    cy.contains('OK').click();

    cy.contains('button', 'Перейти в поиск').click();

    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });

    cy.get('[data-test=search-input]').type('кисть');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/4605?treeId=58
  it('#4605 Отмена позиции до и после создания заказа', () => {
    cy.get('[data-test=select-appeal]').click();
    cy.contains('Новый заказ').click();
    cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.contains('div', 'Скрыть нулевые остатки')
      .parent()
      .find('button[role=switch]')
      .then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.wrap($switch).click();
        }
      });

    cy.get('[data-test=search-input]').type('краска');

    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').each(($option, index) => {
      if (index === 2) return false;
      cy.wrap($option).click({ force: true });
      cy.contains('button', 'Добавить').click();
    });

    cy.get('[data-test=to-cart-button]').click();

    cy.get('[data-test=cart-position]').should('have.length', 2);
    cy.get('[data-test=delete-position]').first().click();
    cy.contains('Отмененные').should('not.exist');
    cy.get('[data-test=cart-position]').should('have.length', 1);

    cy.get('[data-test=make-order]').click();

    cy.get('[data-test=delete-position]').first().click();
    cy.get('[data-test=cart-position]').should('have.length', 0);
    cy.contains('Отмененные').should('exist');

    cy.get('[data-test=save-order]').click();

    cy.get('[data-test=order-status-tag]').contains('Отменённые');
  });
});
