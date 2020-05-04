const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.closeBrowser();
});

describe('When logged in', () => {
  beforeEach(async () => {
    await page.login();
    await page.waitFor('a.btn-floating');
    await page.click('a.btn-floating');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', () => {
    beforeEach(async () => {
      await page.type('.title input', 'Test Blog Title');
      await page.type('.content input', 'Test Blog Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blogs to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('.card-content p');

      expect(title).toEqual('Test Blog Title');
      expect(content).toEqual('Test Blog Content');
    });
  });

  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs',
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'Test Blog Title',
        content: 'Test Blog Content',
      },
    },
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);

    for (result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
