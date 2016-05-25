import { getModule, replaceCodeMemory, addNpmPackageMemory } from '../utils';

async function generateJadeTemplateEngine(params) {
  switch (params.framework) {
    case 'express':
      // Add Jade to package.json
      await addNpmPackageMemory('jade', params);

      // Set "views dir" and "view engine" Express settings
      await replaceCodeMemory(params, 'server.js', 'TEMPLATE_ENGINE', await getModule('template-engine/jade/jade-express.js'));

      // Add layout template
      params.build.views = {
        'layout.jade': await getModule('template-engine/jade/views/layout.jade')
      };

      if (params.jsFramework) {
        // Use "#app-container" div element for single page app
        await replaceCodeMemory(params, 'views/layout.jade', 'APP_CONTAINER_OR_BLOCK_CONTENT', await getModule('template-engine/jade/app-container.jade'), { indentLevel: 2 });
      } else {
        // Require HomeController, add "/" route
        if (!params.jsFramework) {
          params.build.controllers['home.js'] = await getModule('template-engine/controllers/home-controller-express.js');
          await replaceCodeMemory(params, 'server.js', 'HOME_ROUTE', await getModule('template-engine/routes/home-route-express.js'));
          await replaceCodeMemory(params, 'server.js', 'HOME_CONTROLLER', await getModule('template-engine/controllers/home-require.js'));
        }

        // Use "block content" for traditional web app
        await replaceCodeMemory(params, 'views/layout.jade', 'APP_CONTAINER_OR_BLOCK_CONTENT', await getModule('template-engine/jade/block-content.jade'), { indentLevel: 2 });

        // Add initial page templates
        params.build.views['home.jade'] = await getModule(`template-engine/jade/views/home-${params.cssFramework}.jade`);
        params.build.views['contact.jade'] = await getModule(`template-engine/jade/views/contact-${params.cssFramework}.jade`);
        params.build.views.includes = {
          'footer.jade': await getModule('template-engine/jade/views/footer.jade'),
          'header.jade': await getModule(`template-engine/jade/views/header-${params.cssFramework}.jade`)
        };

        // If authentication is checked: add log in, sign up, logout links to the header
        if (params.authentication.length) {
          const headerAuthIndent = { none: 2, bootstrap: 3, foundation: 3 };
          await replaceCodeMemory(params, 'views/includes/header.jade', 'HEADER_AUTH', await getModule(`template-engine/jade/views/header-auth-${params.cssFramework}.jade`), {
            indentLevel: headerAuthIndent[params.cssFramework]
          });
        }
      }

      // OPTIONAL: Add Socket.IO <script> import
      if (params.frameworkOptions.includes('socketio')) {
        await replaceCodeMemory(params, 'views/layout.jade', 'SOCKETIO_IMPORT', await getModule('template-engine/jade/socketio-import.jade'), { indentLevel: 2 });
      }
      break;

    case 'meteor':
      break;

    default:
  }
}

export default generateJadeTemplateEngine;
