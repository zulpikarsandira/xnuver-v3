import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';
import { executeCommand, checkForCommands } from './backgroundTask';

// Register the Headless JS Task
const HeadlessTask = async (data) => {
    console.log('[HEADLESS_TASK] Triggered from native service');
    try {
        await checkForCommands();
    } catch (e) {
        console.error('[HEADLESS_TASK] Error:', e);
    }
};

AppRegistry.registerHeadlessTask('XNUVER_BG_TASK', () => HeadlessTask);

// Register the main application component
registerRootComponent(App);
