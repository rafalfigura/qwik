import { component$, Host, useStyles$, useWatch$, useStore } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { Repl } from '../../../repl/repl';
import styles from './examples.css?inline';
import { Header } from '../../../components/header/header';
import exampleSections, { ExampleApp } from '@examples-data';
import type { ReplAppInput } from '../../../repl/types';
import { DocumentHead, useLocation } from '@builder.io/qwik-city';
import { PanelToggle } from '../../../components/panel-toggle/panel-toggle';

export default component$(() => {
  useStyles$(styles);

  const { params } = useLocation();
  const panelStore = useStore(() => ({
    active: 'Examples',
    list: PANELS,
  }));

  const store = useStore<ExamplesStore>(() => {
    const app = getExampleApp(params.id);
    const initStore: ExamplesStore = {
      appId: params.id,
      buildId: 0,
      buildMode: 'development',
      entryStrategy: 'hook',
      files: app?.inputs || [],
      version: '',
    };
    return initStore;
  });

  useWatch$(({ track }) => {
    const appId = track(store, 'appId');
    const app = getExampleApp(appId);
    store.files = app?.inputs || [];
    if (typeof document !== 'undefined') {
      document.title = `${app?.title} - Qwik`;
    }
  });

  return (
    <Host class="examples full-width fixed-header">
      <Header />

      <div
        class={{
          'examples-menu-container': true,
          'examples-panel-input': panelStore.active === 'Input',
          'examples-panel-output': panelStore.active === 'Output',
          'examples-panel-console': panelStore.active === 'Console',
        }}
      >
        <div class="examples-menu">
          {exampleSections.map((s) => (
            <div key={s.id} class="examples-menu-section">
              <h2>{s.title}</h2>

              {s.apps.map((app) => (
                <a
                  key={app.id}
                  href={`/examples/${app.id}`}
                  preventDefault:click
                  onClick$={() => {
                    store.appId = app.id;
                    panelStore.active === 'Input';
                    history.replaceState({}, '', `/examples/${app.id}`);
                  }}
                  class={{
                    'example-button': true,
                    selected: store.appId === app.id,
                  }}
                >
                  <div class="example-button-icon">{app.icon}</div>
                  <div class="example-button-content">
                    <h3>{app.title}</h3>
                    <p>{app.description}</p>
                  </div>
                </a>
              ))}
            </div>
          ))}
          <a
            href="https://github.com/BuilderIO/qwik/tree/main/packages/docs/src/routes/examples/apps/"
            class="example-button-new"
            target="_blank"
          >
            👏 Add new examples
          </a>
        </div>

        <main class="examples-repl">
          <Repl
            input={store}
            enableSsrOutput={false}
            enableClientOutput={false}
            enableHtmlOutput={false}
            enableCopyToPlayground={true}
            enableDownload={true}
            enableInputDelete={false}
          />
        </main>
      </div>
      <PanelToggle panelStore={panelStore} />
    </Host>
  );
});

export const getExampleApp = (id: string): ExampleApp | undefined => {
  for (const exampleSection of exampleSections) {
    for (const app of exampleSection.apps) {
      if (app.id === id) {
        return JSON.parse(JSON.stringify(app));
      }
    }
  }
};

export const head: DocumentHead = ({ params }) => {
  const app = getExampleApp(params.id);
  return {
    title: app?.title || 'Example',
  };
};

export const PANELS: ActivePanel[] = ['Examples', 'Input', 'Output', 'Console'];

interface ExamplesStore extends ReplAppInput {
  appId: string;
}

type ActivePanel = 'Examples' | 'Input' | 'Output' | 'Console';

export const onGet: RequestHandler = ({ response }) => {
  response.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
  );
};
