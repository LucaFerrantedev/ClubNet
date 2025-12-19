import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import type { BootstrapContext } from '@angular/platform-browser';

// Usamos 'config' directamente, ya que ya incluye provideServerRendering()
const bootstrap = (context: BootstrapContext | undefined) => bootstrapApplication(App, config, context);

export default bootstrap;