const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

process.exit = jest.fn();

window = { localStorage: jest.fn() };

enzyme.configure({ adapter: new Adapter() });
