describe('Создание заказа через мессенджер', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  // https://allure.itlabs.io/project/28/test-cases/5664?treeId=58
  it('#5664 Создание стандартного заказа через мессенджер, со сменой ЕИ', () => {
    cy.createAppeal({ auth: { type: 'messanger', value: '9992222222' } });
    cy.contains('div', 'Причина обращения').click({ force: true });
    cy.contains('Новый заказ').click();
    cy
      .get('.ant-select-selection-overflow-item')
      ?.first()
      ?.click({ force: true });
    cy.get('.ant-select-item-option').first().click({ force: true });
    cy.get('[data-test=remain-switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    cy.get('[data-test=search-input]').type('гайка');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]')?.first()?.click();
    cy.get('.ant-btn-primary').contains('Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[class^="_position_"]').first().click();

    cy.get('[data-test=modal-edit-input-price]')
      .invoke('val')
      .should('not.be.empty')
      .then((inputText) => {
        const priceBeforeChangeUnit = `${inputText}`
          .replace(/[^\d.,]/g, '')
          .replace(/,/g, '.');

        cy.get('[data-test=modal-edit-units]').click();
        cy.get('[data-test=unit-PAA]').click();

        cy.get('[data-test=modal-edit-input-price]')
          .should('not.have.value', inputText)
          .invoke('val')
          .then((someText) => {
            const priceAfferChangeUnit = `${someText}`;
            const priceAffertTransform = priceAfferChangeUnit
              .replace(/[^\d.,]/g, '')
              .replace(/,/g, '.');

            expect(+priceAffertTransform / 2).to.equal(+priceBeforeChangeUnit);

            cy.contains('button', 'Сохранить').click();
            cy.get('[data-test=make-order]').click();
            cy.contains('Заказ успешно создан').should('exist');
            cy.contains('Заказ №').should('exist');

            cy.get('[data-test=cart-total-cost]')
              .first()
              .then(($posText) => {
                const posValue = $posText.text().replace(/[^\d.]/g, '');

                expect(+posValue / 2).to.equal(+priceBeforeChangeUnit);
              });
          });
      });
  });
});
