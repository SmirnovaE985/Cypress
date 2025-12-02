// #5374 Нельзя применять промокод на ручные цены [ok]
// #5369 Если после создания заказа использовать ручную цену, но вернуть обратно продажную цену, баллы ПЛ будут начислены [ok]
// #5370 Если до создания заказа изменить ручную цену, а после создания вернуть продажную, баллы ПЛ начислятся [ok]
// #5386 Повторное применение/ отмена одинакового количества баллов [ok]
// #5365 Применение баллов ПЛ, сертификата и промокода вместе [ok]
// #5531 Применение баллов, промокода с ошибкой и ручной ценой [ok]
// #5385 Применении ручной цены и списание баллов (на эксперте)[ok]
// #5380 При переходе из одного заказа в другой, вся информация в блоке промо обновляется [ok]
// #5373 Списание и начисление баллов в заказе с ЗАЗой [ok]
// #5375 Списание и отмена списания баллов ПЛ с применением сертификата (мастер) [ok]
// #5383 Нельзя использовать недействующий сертификат [ok]
// #5357 Нельзя списывать баллы в предложении [ok]

describe('Кейсы c промо', () => {
  beforeEach(() => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.login();
  });

  // https://allure.itlabs.io/project/28/test-cases/5374?treeId=58
  it('#5374 Нельзя применять промокод на ручные цены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal({ auth: { value: '9000000055', type: 'phone' } });

    cy.addPositionToCart({
      text: '2777',
      quantity: 10,
      afterAddPositionGoToCart: true,
    });
    cy.get('[class^="_position_"]').first().click();
    cy.wait(1000);
    cy.get('[data-test=modal-edit-input-price]').type('9');
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.get('[data-test=promocode-block-title]').click();
    cy.get('input[name=promocode]').first().type('CALLCENTER1');

    cy.get('[data-test=promocode-apply]').click();
    cy.contains('Купите товаров ещё на ').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/5369?treeId=58
  it('#5369 Если после создания заказа использовать ручную цену, но вернуть обратно продажную цену, баллы ПЛ будут начислены', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal();

    cy.addPositionToCart({ text: 'цемент' });
    cy.get('[data-test=search-input]').clear().type('ведро');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]')?.first()?.click();
    cy.get('.ant-btn-primary').contains('Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=make-order]').click();

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.get('[data-test=cart-position-bonus]')
          .first()
          .invoke('text')
          .then((bonusesFirstPos) => {
            cy.get('[class^="_position_"]').first().click();
            cy.wait(1000);

            cy.get('[data-test=modal-edit-input-price]')
              .invoke('val')
              .then((priceValText) => {
                const num = Number(
                  `${priceValText}`.replace(/\s|₽/g, '').replace(',', '.'),
                );
                const priceDiff = num + 1;

                cy.get('[data-test=modal-edit-input-price]')
                  .clear()
                  .type(`${priceDiff}`);
                cy.contains('span', 'Сохранить').click();

                cy.get('[data-test=save-order]').click();
                cy.contains('Успешно сохранено').should('exist');

                cy.get('[data-test=cart-total-bonus]')
                  .invoke('text')
                  .then((totalBonusesAfterSave) => {
                    const priceDiffNum = +initBonus - +bonusesFirstPos;

                    expect(+totalBonusesAfterSave).to.eq(priceDiffNum);
                  });
              });
          });
      });

    cy.get('input[name="applyingAmount"]').clear().type('1');
    cy.get('[data-test=bonuses-check]').click({ force: true });
    cy.get('[data-test=applying-bonuses]').click({ force: true });
    cy.wait(5000);
    cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
      cy.get('input[name="sms"]').type(promoCode);
      cy.get('[data-test=confirm-sms-code]').click();
      cy.contains('Код подтвержден').should('exist');
      cy.contains('Успешно сохранено').should('exist');
      cy.contains('Успешно сохранено').should('exist');

      cy.get('[class^="_striked_"]').then((res) => {
        expect(res.length).to.eq(2);
      });
    });

    cy.get('[class^="_position_"]').first().click();
    cy.wait(1000);
    cy.get('[data-test=price-imkc-edit-modal]').click();
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/5370?treeId=58
  it('#5370 Если ДО создания заказа изменить ручную цену, а после создания вернуть продажную, баллы ПЛ начислятся', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal();
    cy.addPositionToCart({ text: 'Краска', afterAddPositionGoToCart: true });

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.get('[class^="_position_"]').first().click();
        cy.wait(2000);
        cy.get('[data-test=modal-edit-input-price').type('{backspace}');
        cy.contains('span', 'Сохранить').click();
        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');

        cy.get('[data-test=cart-total-bonus]')
          .invoke('text')
          .then((totalBonusesAfterSave) => {
            expect(+totalBonusesAfterSave).to.eq(0);

            cy.get('input[name="applyingAmount"]').clear().type('1');
            cy.get('[data-test=bonuses-check]').click({ force: true });
            cy.get('[data-test=applying-bonuses]').click({ force: true });
            cy.wait(5000);
            cy.getPromoCodeFromChatRosaMessage('+79000000055').then(
              (promoCode) => {
                cy.get('input[name="sms"]').type(promoCode);
                cy.get('[data-test=confirm-sms-code]').click();

                cy.contains('Код подтвержден').should('exist');
                cy.contains('Успешно сохранено').should('exist');
                cy.contains('Успешно сохранено').should('exist');

                cy.get('[data-test=cart-position-bonus]').should('not.exist');

                cy.get('[class^="_striked_"]').then((res) => {
                  expect(res.length).to.eq(1);
                });
              },
            );
          });

        cy.get('[class^="_position_"]').first().click();
        cy.wait(1000);
        cy.get('[data-test=price-imkc-edit-modal]').click();
        cy.contains('span', 'Сохранить').click();
        cy.get('[data-test=save-order]').click();
        cy.contains('Успешно сохранено').should('exist');

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });

        cy.get('[data-test=cart-total-bonus]').should('not.be.a', '0');
      });
  });

  // https://allure.itlabs.io/project/28/test-cases/5980?treeId=58
  it('#5980 Нельзя дополнительно списать баллы в заказе, в котором уже было списание', () => {
    cy.visit('/', { onBeforeLoad: (win) => win.sessionStorage.clear() });
    cy.createAppeal();
    cy.addPositionToCart({ text: 'ведро', afterAddPositionGoToCart: true });

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);

        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();

          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });
    //перейти в поиск
    cy.get('[data-test=btn-go-in-search]').click();
    cy.get('[data-test=search-input]').type('ведро');
    cy.get('[data-test=search-button]').click();
    cy.get('[data-test=shopping-card-button]').first().click();
    cy.contains('button', 'Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
    //проверяем, что элементы "striked" на старнице присутствуют, в количестве 2
    cy.get('[class^="_striked_"]').then((res) => {
      expect(res.length).to.eq(2);
    });

    cy.get('[data-test=bonuses-container]')
      .find('[data-test=confirm-sms-code]')
      .should('not.exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5386?treeId=58
  it('#5386 Повторное применение/ отмена одинакового количества баллов', () => {
    cy.createAppeal();
    cy.addPositionToCart({ text: 'ведро', afterAddPositionGoToCart: true });

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);

        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();

          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
        cy.contains('span', 'Отменить').click();
        cy.contains('span', 'Проверить').should('exist');
        //повторно ввести такое же количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(4000);
        cy.contains('div', 'Списано').should('exist');
      });
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5365?treeId=58
  it('#5365 Применение баллов ПЛ, сертификата и промокода вместе (эксперт)', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '14333',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);
        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();

          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });
    cy.contains('div', 'Промокод').click();
    cy.get('[data-test=promocode]').type('CALLCENTER1');
    cy.get('[data-test=confirm-sms-code]').click();
    //проверяем применение промокода
    cy.get('[data-test=promocode-aprove]').should('exist');

    cy.get('[data-test=certificate-title]').click();
    cy.get('[data-test="sertificat"]').type('CERTCALLCENTER');
    cy.get('[data-test="use-sertificat"]').click({ force: true });
    cy.get('[data-test="certificate-value"]').click().type('2');
    cy.get('[data-test=confirm-sms-code]').click();
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(1000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5531?treeId=58
  it('#5531 Применение баллов, промокода с ошибкой и ручной ценой', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '212980',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);
        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();
          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });

    cy.contains('div', 'Промокод').click();
    cy.get('[data-test=promocode]').type('CALLCENTER1');
    cy.get('[data-test=confirm-sms-code]').click();
    // вывести ошибку
    cy.contains('Купите товаров ещё на').should('exist');
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=add-quantity-input]').clear().type('4');
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=save-order]').click();

    cy.get('[data-test=promocode]').click();
    cy.get('[data-test=promocode]').type('CALLCENTER1');
    cy.contains('span', 'Применить');
    //проверить элементы страйк на странице 1 шт
    cy.get('[class^="_striked_"]').then((res) => {
      expect(res.length).to.eq(1);
    });
    //в модалке товара меняем цену
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=modal-edit-input-price]').clear().type('689');
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=save-order]').click();
    //проверяем, что промокод отменен при ручной цене
    cy.contains('div', 'Применено').should('not.exist');
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/5385?treeId=58
  it('#5385 Применении ручной цены и списание баллов', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '86584',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);
        cy.get('[data-test=make-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');
        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();
          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });

    //в модалке товара меняем цену
    cy.get('[data-test=cart-position]').click();
    cy.get('[data-test=modal-edit-input-price]').clear().type('689');
    cy.contains('span', 'Сохранить').click();
    cy.get('[data-test=save-order]').click();
    cy.contains('div', 'Применено').should('not.exist');
    //проверить элементы страйк на странице 1 шт
    cy.get('[class^="_striked_"]').then((res) => {
      expect(res.length).to.eq(1);
    });
    cy.get('[data-test=delete-all-position]').click();
    cy.wait(2000);
    cy.contains('span', 'OK').click();
    cy.get('[data-test=save-order]').click();
  });

  //https://allure.itlabs.io/project/28/test-cases/5385?treeId=58
  it('#5380 При переходе из одного заказа в другой, вся информация в блоке промо обновляется', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '86584',
      afterAddPositionGoToCart: true,
    });

    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);
        cy.get('[data-test=save-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');

        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();

          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });

    cy.get('[data-test=close-order-btn]').click({ force: true });
    cy.contains('span', 'OK').click();
    cy.contains('span', 'Вернуться назад').click();
    cy.get('[data-test=search-input]').clear().type('валик');
    // Кликаем на кнопку поиска
    cy.get('[data-test=search-button]').click();
    // Открываем модалку быстрого добавления у первого товара из списка
    cy.get('[data-test=shopping-card-button]').first().click();

    cy.get('.ant-btn-primary').contains('Добавить').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test=make-order]').click();
    cy.get('[data-test=close-order-btn]').click({ force: true });
    cy.contains('span', 'OK').click();
    //идем в историю
    cy.get('[data-test=go-appeal-history]').click();
    //отжимаем свитчер заказ
    cy.get('button[role=switch]').then(($switch) => {
      if ($switch.attr('aria-checked') === 'false') {
        cy.wrap($switch).click();
      }
    });
    cy.get('[data-icon=form]').first().click();
    cy.contains('span', 'Проверить').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5373?treeId=58
  it('#5373 Списание и начисление баллов в заказе с ЗАЗой', () => {
    // Выбираем СД Тюмень
    cy.createAppeal();
    cy.openPositionCard('79000');
    cy.get('[data-test=ZAZA]').click();
    //выбрать завод-получатель
    cy.get('[data-test=search-input-store]').find('input[type=search]').click();
    cy.contains('1023 БМ Тмн, Клары Цеткин, 2').click({ force: true });
    // Выбираем пункт отгрузки
    cy.get('[data-test="search-input-shipment"]')
      .find('input[type=search]')
      .click();
    cy.get('.zaza-dropdown')
      .find('.ant-select-item-option')
      .contains('Тмн')
      .click();
    // Нажимаем 'Добавить'
    cy.get('[data-test=add-position-to-cart]').click();
    // Переходим в корзину
    cy.get('[data-test="to-cart-button"]').click();
    // Нажимаем создать заказ
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');

    cy.get('[data-test=cart-total-bonus]')
      .invoke('text')
      .then((initBonus) => {
        cy.wait(2000);
        cy.get('[data-test=save-order]').click();
        cy.contains('Заказ успешно создан').should('exist');
        cy.contains('Заказ №').should('exist');

        //ввести в инпут количество баллов
        cy.get('input[name="applyingAmount"]').clear().type('1');
        cy.get('[data-test=bonuses-check]').click({ force: true });
        cy.get('[data-test=applying-bonuses]').click({ force: true });
        cy.wait(5000);
        cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
          cy.get('input[name="sms"]').type(promoCode);
          cy.get('[data-test=confirm-sms-code]').click();

          cy.contains('Код подтвержден').should('exist');
          cy.contains('Успешно сохранено').should('exist');
        });

        cy.get('[class^="_promoPreview__count_"]')
          .invoke('text')
          .then((bonusTotalText) => {
            expect(bonusTotalText).to.eq('-1 баллов');
          });
      });
    cy.contains('div', 'Списано').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.contains('ЗаЗа -').should('exist');
  });

  //https://allure.itlabs.io/project/28/test-cases/5375?treeId=58
  it('#5375 Списание и отмена списания баллов ПЛ с применением сертификата', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '86584',
      afterAddPositionGoToCart: true,
    });
    cy.contains('span', 'Перс. цена').should('exist');
    // в корзине заказа выбрать сопутствующий товар
    cy.contains('Перчатки ').click();
    cy.get('[data-test=add-position-to-cart]').click();
    cy.get('[data-test=to-cart-button]').click();
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    //ввести в инпут количество баллов
    cy.get('input[name="applyingAmount"]').clear().type('2');
    cy.get('[data-test=bonuses-check]').click({ force: true });
    cy.get('[data-test=applying-bonuses]').click({ force: true });
    cy.wait(5000);
    cy.getPromoCodeFromChatRosaMessage('+79000000055').then((promoCode) => {
      cy.get('input[name="sms"]').type(promoCode);
      cy.get('[data-test=confirm-sms-code]').click();
      cy.contains('Успешно сохранено').should('exist');
    });

    cy.get('[class^="_promoPreview__count_"]')
      .invoke('text')
      .then((bonusTotalText) => {
        expect(bonusTotalText).to.eq('-2 баллов');
      });

    cy.get('[class^="_striked_"]').then((res) => {
      expect(res.length).to.eq(2);
    });
    cy.get('[data-test=certificate-title]').click();
    cy.get('[data-test="sertificat"]').type('CERTCALLCENTER');
    cy.get('[data-test="use-sertificat"]').click({ force: true });
    cy.get('[data-test="certificate-value"]').click().type('2');
    cy.get('[data-test=use]').click();
    cy.get('[data-test=promocode-aprove]').should('exist');
    cy.contains('span', 'Отменить').click();
    cy.contains('Применение баллов отменено').should('exist');
    cy.get('[data-test=promocode-aprove]').should('exist');
  });

  // https://allure.itlabs.io/project/28/test-cases/5383?treeId=58
  it('#5383 Нельзя использовать недействующий сертификат', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '2212',
      afterAddPositionGoToCart: true,
    });
    cy.contains('span', 'Перс. цена').should('exist');
    cy.get('[data-test="make-order"]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
    cy.get('[data-test=certificate-title]').click();
    cy.get('[data-test="sertificat"]').type('oshibka');
    cy.get('[data-test=use-sertificat]').click();
    cy.contains('Неверный сертификат').should('exist');

    cy.get('[data-test="sertificat"]').clear().type('SERTIFICATAUTO');
    cy.get('[data-test=use-sertificat]').click();
    cy.get('[data-test="certificate-value"]').click().type('2');
    cy.get('[data-test=use]').click();
    cy.contains('Сертификат не применен').should('exist');
    cy.get('[data-test="delete-all-position"]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test="save-order"], [data-test="save-offer"]').click();
  });

  // https://allure.itlabs.io/project/28/test-cases/5357?treeId=58
  it('#5357 Нельзя списывать баллы в предложении', () => {
    cy.createAppeal();
    cy.addPositionToCart({
      text: '159817',
      afterAddPositionGoToCart: true,
    });
    cy.get('[data-test="make-offer"]').click();
    cy.contains('Предложение успешно создано').should('exist');
    cy.contains('Предложение №').should('exist');
    cy.get('input[name="applyingAmount"]').should('not.exist');
    cy.get('[data-test="delete-all-position"]').click();
    cy.contains('.ant-modal', 'Удалить все позиции?')
      .contains('button', 'OK')
      .click();
    cy.get('[data-test="save-order"], [data-test="save-offer"]').click();
  });
});
