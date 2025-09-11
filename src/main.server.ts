import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { provideServerRendering } from '@angular/platform-server';

// Mantén la configuración de providers
const serverConfig = {
  ...config,
  providers: [
    ...(config.providers || []),
    provideServerRendering()
  ]
};

// Recibe el contexto y pásalo a bootstrapApplication
import type { BootstrapContext } from '@angular/platform-browser';

const bootstrap = (context: BootstrapContext | undefined) => bootstrapApplication(App, serverConfig, context);

export default bootstrap;