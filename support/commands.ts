Cypress.Commands.add('login', (credentials) => {
  cy.get('input[name=login]').type(
    credentials ? credentials.login : Cypress.env('CEREBRO_LOGIN'),
  );
  cy.get('input[name=password]').type(
    credentials ? credentials.password : Cypress.env('CEREBRO_PASSWORD'),
  );
  cy.get('button[type=submit]').click();
  cy.url().should('equal', `${Cypress.config().baseUrl}/home`);
  cy.contains(/Добро пожаловать.*/).should('exist');
});

Cypress.Commands.add('stubWindowOpen', () => {
  cy.window().then((win) => {
    cy.stub(win, 'open').callsFake((url) => {
      return win.open.wrappedMethod.call(win, url, '_self');
    });
  });
  cy.wait(1000);
});

interface ICreateAppealOption {
  auth: {
    type: 'phone' | 'messanger' | 'email' /* Выбираем тип обращения */;
    value: string /* Вводим нужное значение (номер / е-мейл) */;
  };
  options?: {
    name?: string /* Вводим имя для создания клиента в первый раз */;
    clientType?:
      | 'individual'
      | 'legalEntity' /* Выбираем тип клиента (физ. лицо / юридическое)*/;
  };
}

/*
  createAppeal может вызываться как и без опций, так и с передачей опций

  Если вызвали без опций, то создается обращения на номер телефона, который берется из Cypress.env('CLIENT_PHONE')

  Передача опций нужна для:
    1. Создания обращения на конкретный номер, на конкретный тип
    2. Создания обращения в первый раз для клиента, где мы выбираем имя клиента и его тип
    2.1. При создании в первый раз, мы можем не передавать имя клиента, и оно возьмётся из Cypress.env('CLIENT_NAME')

  При передачи опций, св-во auth обязательно к заполнению
*/

// создание обращения
Cypress.Commands.add('createAppeal', (option?: ICreateAppealOption) => {
  cy.stubWindowOpen();
  cy.contains('Клиенты').trigger('mouseover', { force: true });
  cy.contains('Новое обращение').click({ force: true });

  const labelType = {
    phone: 'Телефон',
    messanger: 'Мессенджер',
    email: 'E-mail',
  };

  const clientTypeName = {
    individual: 'Физическое лицо',
    legalEntity: 'Юридическое лицо',
  };

  if (option?.auth.type === 'phone' || !option) {
    cy.contains('label', labelType.phone).click();
    cy.get('input[name="phone"]').type(
      option?.auth ? option?.auth.value : Cypress.env('CLIENT_PHONE'),
    );
  } else {
    cy.contains('label', labelType[option?.auth.type]).click();
    cy.get(`input[name=${option?.auth.type}]`).type(option?.auth.value);
  }

  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/selectClient');
  if (!option?.options?.name) {
    cy.get('[data-test="select-client"]').first().click();
  } else {
    cy.get('body').then(($body) => {
      if ($body.find('#create-client_typeId').length >= 0) {
        cy.get('#create-client_typeId').click();
        cy.contains(
          option?.options?.clientType
            ? clientTypeName[option?.options?.clientType]
            : 'Физическое лицо',
        ).click();
        cy.get('#create-client_clientName')
          .first()
          .type(option?.options?.name || Cypress.env('CLIENT_NAME'));
        cy.contains('span', 'Создать').click();
      } else {
        cy.contains(
          'li',
          option ? option?.options?.name : Cypress.env('CLIENT_NAME'),
        )
          .get('[data-test="select-client"]')
          .click();
      }
    });
  }
  cy.url()
    .should('include', '/appeal')
    .then((url) => {
      const appealUrl = url.search(
        /\/appeal\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/,
      );
    });
});

interface IAddPositionToCartOption {
  text: string /* Вводим название позиции для поиска */;
  quantity?: number /* Вводим нужное кол-во позиции в модалке быстрого добавления */;
  afterAddPositionGoToCart?: boolean /* После того как добавили, мы сразу переходим в корзину? */;
}

export interface AddPositionToCartResult {
  price: number;
  bonus: number;
  quantity: number;
  cost: number;
}

// TODO добавить возможность менять количество товара внутри модалки быстрого добавления в корзину
// добавление товара через функцию быстрого добавления в корзину
Cypress.Commands.add('addPositionToCart', (option) => {
  cy.get('[data-test=select-appeal]').click();
  // Выбираем 'Новый заказ'
  cy.contains('Новый заказ').click();
  // Нажимаем на список магазинов
  cy
    .get('.ant-select-selection-overflow-item')
    ?.first()
    ?.click({ force: true });
  // Выбираем первый магазин
  cy.get('.ant-select-item-option-content').first().click({ force: true });
  // Включаем скрыть нулевые остатки
  cy.get('[data-test=remain-switch]').then(($switch) => {
    if ($switch.attr('aria-checked') === 'false') {
      cy.wrap($switch).click();
    }
  });
  // Пишем в поисковый инпут текст
  cy.get('[data-test=search-input]').type(option.text);
  // Кликаем на кнопку поиска
  cy.get('[data-test=search-button]').click();
  // Открываем модалку быстрого добавления у первого товара из списка (иконка корзины)
  cy.get('[data-test=shopping-card-button]')?.first()?.click();
  // Если передали кол-во, то в поле количество записываем значение
  if (option.quantity) {
    cy.get('.ant-spin-spinning').should('not.exist');
    cy.get('[data-test=add-quantity-input]')
      .first()
      .clear()
      .type(option.quantity?.toLocaleString());
  }
  // фиксируем промо цену в модалке до добавления в корзину
  cy.get('[data-test=product-info-price]')
    .invoke('text')
    .then((text) =>
      cy
        .wrap(parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')))
        .as('price'),
    );
  // фиксируем баллы в модалке до добавления в корзину
  cy.get('[data-test=product-info-bonus]')
    .invoke('text')
    .then((text) =>
      cy
        .wrap(
          parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')) *
            (option.quantity ?? 1),
        )
        .as('totalBonus'),
    );
  // Добавили товар в корзину
  cy.get('.ant-btn-primary').contains('Добавить').click();
  // Если значение тру, то после добавления позиции, мы переходим в корзину
  if (option.afterAddPositionGoToCart) {
    cy.get('[data-test=to-cart-button]').click();
  }
  //проверяем значения в корзине до создания заказа
  return cy.get('@price').then((price) =>
    cy.get('@totalBonus').then((totalBonus) => {
      const quantity = option.quantity ?? 1;
      return {
        price: +price,
        bonus: +totalBonus,
        quantity,
        cost: quantity * +price,
      };
    }),
  );
});

// открытие карточки товара
Cypress.Commands.add('openPositionCard', (text: string) => {
  cy.get('[data-test=select-appeal]').click();
  cy.contains('Новый заказ').click();
  cy
    .get('.ant-select-selection-overflow-item')
    ?.first()
    ?.click({ force: true });
  cy.contains('div', 'Укажите магазин').find('input[type=search]').click();
  cy.get('.testId-plant-select')
    .find('.ant-select-item-option')
    .first()
    .click({ force: true });
  cy.get('[data-test=remain-switch]').then(($switch) => {
    if ($switch.attr('aria-checked') === 'false') {
      cy.wrap($switch).click();
    }
  });
  cy.get('[data-test=search-input]').type(text);
  cy.get('[data-test=search-button]').click();
  cy.get('[data-test=product-link]')?.first()?.click({ force: true });
});

// проверка перс цены и баллов
Cypress.Commands.add('addPositionToCartFromDetail', (option) => {
  // фиксируем промо цену в модалке до добавления в корзину
  cy.get('[data-test=product-info-price]')
    .invoke('text')
    .then((text) =>
      cy
        .wrap(parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')))
        .as('price'),
    );
  // фиксируем баллы в модалке до добавления в корзину
  cy.get('[data-test=product-info-bonus]')
    .invoke('text')
    .then((text) =>
      cy
        .wrap(
          parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.')) *
            option.quantity,
        )
        .as('totalBonus'),
    );
  // в инпут кол-ва, дождались когда будет 1, очистили и ввели quantity
  cy.get('input[data-test=add-quantity-input]')
    .wait(1000)
    .first()
    .then(($input) => {
      cy.wrap($input).invoke('val').should('eq', '1');
      cy.wrap($input).clear().type(`${option.quantity}`);
    });
  //фиксируем цену в модалке товара в разделе "стоимость"
  // умножаем price на quantity
  cy.get('[data-test=modal-position-cost]')
    .invoke('text')
    .then((text) => {
      const cost = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.get('@price').then((price) => {
        cy.wrap(cost)
          .as('cost')
          .should('eq', +price * quantity);
      });
    });
  //добавляем и переходим в корзину
  cy.contains('button', 'Добавить').click();
  cy.get('[data-test=to-cart-button]').click();
  cy.url().should('include', '/cart');
});

Cypress.Commands.add(
  'getPromoCodeFromChatRosaMessage',
  (phoneNumber: string): Cypress.Chainable<string> => {
    const apiUrl = `${Cypress.env('TG_BOT_ROSA_MESSAGE')}/getUpdates`;

    // Шаг 1: Получаем все старые апдейты и находим максимальный update_id
    return cy
      .request({
        url: apiUrl,
      })
      .then((initialResponse) => {
        const oldUpdates = initialResponse.body.result || [];
        const lastUpdateId = oldUpdates.reduce((max, update) => {
          return update.update_id > max ? update.update_id : max;
        }, 0);

        cy.wait(5000);

        // Шаг 2: Получаем только новые апдейты с offset = lastUpdateId - 1
        return cy.request({
          url: `${apiUrl}?offset=${lastUpdateId - 1}`,
        });
      })
      .then((newResponse) => {
        const updates = newResponse.body.result || [];

        const messages = updates.filter((u) =>
          u.channel_post?.text?.includes(phoneNumber),
        );

        const latestMessage = messages[messages.length - 1];

        if (!latestMessage) {
          throw new Error('Сообщение с нужным номером не найдено в Telegram');
        }

        const codeMatch = latestMessage.channel_post.text.match(
          /Код подтверждения:\s*(\d+)/,
        );

        if (!codeMatch) {
          throw new Error('Код для списания не найден в сообщении');
        }

        return cy.wrap<string>(codeMatch[1]);
      });
  },
);

interface CheckPromoIntoCartOption {
  isOrderCreated?: boolean;
  totalCost: number;
  totalBonus: number;
}

// TODO: сделать возможным проверку корзины с несколькими позициями
Cypress.Commands.add('checkPromoIntoCart', (option) => {
  //смотрим стоимость товаров в корзине ДО создания заказа (пока только с одной позицией)
  cy.get('[data-test=cart-position-cost]')
    .invoke('text')
    .then((text) => {
      const cost = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(cost).should('eq', option.totalCost);
    });
  //смотрим сколько баллов в корзине ДО создания заказа (пока только с одной позицией)
  cy.get('[data-test=cart-position-bonus]')
    .invoke('text')
    .then((text) => {
      const bonus = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(bonus).should('eq', option.totalBonus);
    });

  //смотрим стоимость товаров в общем чеке ДО создания заказа
  cy.get('[data-test=cart-total-cost]')
    .invoke('text')
    .then((text) => {
      const cost = parseFloat(text.replace(/[^\d.]/g, ''));
      cy.wrap(cost).should('eq', option.totalCost);
    });

  //смотрим общее количеств бонусов  в чеке ДО создания заказа
  cy.get('[data-test=cart-total-bonus]')
    .invoke('text')
    .then((text) => {
      const bonus = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(bonus).should('eq', option.totalBonus);
    });

  if (option.isOrderCreated) {
    //сохранили заказ
    cy.get('[data-test=save-order]').click();
    cy.contains('Успешно сохранено').should('exist');
    cy.contains('Заказ №').should('exist');
  } else {
    //создали заказ
    cy.get('[data-test=make-order]').click();
    cy.contains('Заказ успешно создан').should('exist');
    cy.contains('Заказ №').should('exist');
  }

  // сравниваем цену на товары в корзине ПОСЛЕ создания заказа
  cy.get('[data-test=cart-position-cost]')
    .invoke('text')
    .then((text) => {
      const cost = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(cost).should('eq', option.totalCost);
      // cy.get('@cost').should('eq', cost);
    });
  // сравниваем баллы за товары в корзине ПОСЛЕ создания заказа
  cy.get('[data-test=cart-position-bonus]')
    .invoke('text')
    .then((text) => {
      const bonus = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(bonus).should('eq', option.totalBonus);
      // cy.get('@totalBonus').should('eq', bonus);
    });
  // сравниваем цену на общий чек в корзине ПОСЛЕ создания заказа
  cy.get('[data-test=cart-total-cost]')
    .invoke('text')
    .then((text) => {
      const cost = parseFloat(text.replace(/[^\d.]/g, ''));
      cy.wrap(cost).should('eq', option.totalCost);
      // cy.get('@cost').should('eq', cost);
    });
  // сравниваем количество бонусов на товары в общем чеке ПОСЛЕ создания заказа
  cy.get('[data-test=cart-total-bonus]')
    .invoke('text')
    .then((text) => {
      const bonus = parseFloat(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'));
      cy.wrap(bonus).should('eq', option.totalBonus);
      // cy.get('@totalBonus').should('eq', bonus);
    });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(option?: { login: string; password: string }): void;
      createAppeal(option?: ICreateAppealOption): void;
      stubWindowOpen(): void;
      addPositionToCart(
        option: IAddPositionToCartOption,
      ): Chainable<AddPositionToCartResult>;
      openPositionCard(text: string): void;
      getPromoCodeFromChatRosaMessage(phoneNumber: string): Chainable<string>;
      addPositionToCartFromDetail(option: IAddPositionToCartOption): void;
      checkPromoIntoCart(option: CheckPromoIntoCartOption): void;
    }
  }
}

export {};
