import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function postgresApiPlugin(): Plugin {
  return {
    name: 'postgres-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        try {
          const url = new URL(req.url, 'http://localhost:3000');
          const pathname = url.pathname;

          const {
            fetchProductsFromDb,
            fetchProductBySlugFromDb,
            fetchCategoriesFromDb,
            fetchStatsFromDb,
            fetchDbTablesOverview,
            fetchDbTableRows,
            executeDbSafeQuery,
            fetchAdminProducts,
            fetchAdminProductDetail,
            saveAdminProductDetail,
            updateAdminProductStatus,
            fetchCategoryPresets,
            deleteAdminProduct,
            setAdminProductPublish,
            findMatchingCandidates,
            syncExternalSpecs,
          } = await import('./src/server/apiHandler.ts');

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
          }

          // 🛠️ ADMIN DATA CURATION & VERIFICATION API
          if (pathname === '/api/admin/products') {
            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const limit = parseInt(url.searchParams.get('limit') || '25', 10);
            const search = url.searchParams.get('search') || undefined;
            const category = url.searchParams.get('category') || undefined;
            const status = url.searchParams.get('status') || undefined;
            const publishStatus = url.searchParams.get('publishStatus') || undefined;

            const data = await fetchAdminProducts({ page, limit, search, category, status, publishStatus });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          }

          if (pathname === '/api/admin/product-detail') {
            const id = url.searchParams.get('id');
            if (!id) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'ID gerekli' }));
            }
            const data = await fetchAdminProductDetail(id);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          }

          if (pathname === '/api/admin/product-save') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { id, product, specGroups } = JSON.parse(body || '{}');
            if (!id) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'ID gerekli' }));
            }
            const result = await saveAdminProductDetail(id, { product, specGroups });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/admin/product-status') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { id, status } = JSON.parse(body || '{}');
            if (!id || !status) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'ID ve status gerekli' }));
            }
            const result = await updateAdminProductStatus(id, status);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/admin/product-delete') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { id } = JSON.parse(body || '{}');
            if (!id) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'ID gerekli' }));
            }
            const result = await deleteAdminProduct(id);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/admin/product-publish') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { id, isPublished } = JSON.parse(body || '{}');
            if (!id || typeof isPublished !== 'boolean') {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'ID ve isPublished (boolean) gerekli' }));
            }
            const result = await setAdminProductPublish(id, isPublished);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/admin/category-presets') {
            const categorySlug = url.searchParams.get('category') || '';
            const presets = await fetchCategoryPresets(categorySlug);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(presets));
          }

          // 🎯 EPEY / DIŞ KAYNAK AKILLI EŞLEŞTİRME VE SENKRONİZASYON API
          if (pathname === '/api/admin/match-candidates') {
            const query = url.searchParams.get('query') || '';
            const candidates = await findMatchingCandidates(query);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(candidates));
          }

          if (pathname === '/api/admin/sync-external-specs') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const payload = JSON.parse(body || '{}');
            const result = await syncExternalSpecs(payload);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/db/tables') {
            const tables = await fetchDbTablesOverview();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(tables));
          }

          if (pathname === '/api/db/table') {
            const table = url.searchParams.get('name') || 'products';
            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const limit = parseInt(url.searchParams.get('limit') || '25', 10);
            const search = url.searchParams.get('search') || undefined;
            const data = await fetchDbTableRows(table, { page, limit, search });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          }

          if (pathname === '/api/db/query') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { sql } = JSON.parse(body || '{}');
            const result = await executeDbSafeQuery(sql || '');
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          }

          if (pathname === '/api/stats') {
            const stats = await fetchStatsFromDb();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(stats));
          }

          if (pathname === '/api/categories') {
            const cats = await fetchCategoriesFromDb();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(cats));
          }

          if (pathname === '/api/products/trending') {
            const limit = parseInt(url.searchParams.get('limit') || '8', 10);
            const prods = await fetchProductsFromDb({ limit, sortBy: 'recommended' });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(prods));
          }

          if (pathname.startsWith('/api/products/') && pathname !== '/api/products') {
            const slug = decodeURIComponent(pathname.replace('/api/products/', ''));
            const prod = await fetchProductBySlugFromDb(slug);
            if (!prod) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Product not found' }));
            }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(prod));
          }

          if (pathname === '/api/products') {
            const category = url.searchParams.get('category') || undefined;
            const brand = url.searchParams.get('brand') || undefined;
            const query = url.searchParams.get('query') || undefined;
            const sortBy = url.searchParams.get('sortBy') || undefined;
            const minPrice = url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : undefined;
            const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : undefined;
            const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 100;
            const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!, 10) : 0;
            const idsParam = url.searchParams.get('ids');
            const ids = idsParam ? idsParam.split(',') : undefined;

            const prods = await fetchProductsFromDb({
              category,
              brand,
              query,
              sortBy,
              minPrice,
              maxPrice,
              limit,
              offset,
              ids,
            });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(prods));
          }

          return next();
        } catch (err: any) {
          console.error('[API HATA]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), postgresApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
