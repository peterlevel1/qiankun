// import './import-html-entry';
import { start, registerMicroApps } from './apis';

registerMicroApps([
  {
    name: 'vue',
    entry: '//localhost:7101',
    container: '#subapp-viewport',
    // loader,
    activeRule: '/vue',
    props: {
      msg: '[vue]: hello world',
    },
  },
]);

start();
