import { test as base, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductDetailsPage } from '../pages/product.details.page';
import { BillingAddressPage } from '../pages/billing.address.page';
import { PaymentPage } from '../pages/payment.page';
import { getRandomEmail } from './utils';

// Фикстура — ресурс произвольной природы, который раннер по рецепту создаёт для теста
// (по умолчанию лениво и на каждый тест), передаёт в тест по имени и убирает после него.

interface User { // что тест получит от фикстуры
    email: string;
    password: string;
}

interface MyFixtures {
    lang: string;

    homePage: HomePage;
    loginPage: LoginPage;
    productDetailsPage: ProductDetailsPage;
    billingPage: BillingAddressPage;
    paymentPage: PaymentPage;

    registeredUser: User;
    loggedInUser: User;
}

// новый test = старый 
//  + параметр lang
//  + инструкции по созданию объекта страницы home 
//  + инструкции по созданию объекта страницы login 
//  + инструкции по созданию объекта страницы pdp
//  + инструкции по созданию объекта страницы billing
//  + инструкции по созданию объекта страницы payment
//  + создание нового юзера прямо через API
//  + создание нового юзера прямо через API и логин им же через манипуляцию с localStorage

// extend - функция с 1 параметром, но перед ее вызовом нужно указать его тип данных
export const test = base.extend<MyFixtures>({
    // project settings
    lang: ['en', { option: true }],

    // page objects
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    productDetailsPage: async ({ page }, use) => {
        await use(new ProductDetailsPage(page));
    },
    billingPage: async ({ page }, use) => {
        await use(new BillingAddressPage(page));
    },
    paymentPage: async ({ page }, use) => {
        await use(new PaymentPage(page));
    },

    // юзер зарегистрированный через API, а не через веб интерфейс
    registeredUser: async ({ request }, use) => { // request — встроенный HTTP-клиент, браузер не нужен
        // тест получит этот объект, если регистрация пройдет успешно
        const user: User = { email: getRandomEmail(), password: 'wordPASS123!' };
        const response = await request.post('https://api.practicesoftwaretesting.com/users/register', {
            data: { // data → JSON-тело, Content-Type ставится сам
                first_name: 'Alex',
                last_name: 'Artukh',
                dob: '1983-04-23',
                phone: '601267',
                email: user.email,
                password: user.password,
                address: { street: 'Broadway', city: 'Chicago', state: 'Illinois', country: 'US', postal_code: '60601' },
            },
        });
        expect(response.status(), await response.text()).toBe(201);  // не 201 → тест падает, в сообщении ответ сервера
        await use(user);
    },

    // юзер зарегистрированный + вошедший через API, а не через веб интерфейс
    // использует предыдущую фикстуру для регистрации
    loggedInUser: async ({ page, request, registeredUser }, use) => {
        const loginOptions = {
            data: { email: registeredUser.email, password: registeredUser.password },
        };
        const response = await request.post('https://api.practicesoftwaretesting.com/users/login', loginOptions);
        expect(response.status(), await response.text()).toBe(200);
        const responseBody = await response.json();
        const accessToken: string = responseBody.access_token;

        await page.addInitScript((token: string) => {
            if (window.location.hostname === 'practicesoftwaretesting.com') { // только на нашем сайте
                window.localStorage.setItem('auth-token', token);
            }
        }, accessToken); // второй аргумент передаётся в функцию как token

        await use(registeredUser);
    },
});

export { expect } from '@playwright/test';