# Leads Route Integration

Add the following route definition to your `resources/js/routes/index.ts` file, following the same pattern as the dashboard route:

```typescript
/**
 * @see routes/web.php:15
 * @route '/leads'
 */
export const leads = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leads.url(options),
    method: 'get',
})

leads.definition = {
    methods: ["get", "head"],
    url: '/leads',
} satisfies RouteDefinition<["get", "head"]>

/**
 * @see routes/web.php:15
 * @route '/leads'
 */
leads.url = (options?: RouteQueryOptions) => {
    return leads.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:15
 * @route '/leads'
 */
leads.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leads.url(options),
    method: 'get',
})

/**
 * @see routes/web.php:15
 * @route '/leads'
 */
leads.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: leads.url(options),
    method: 'head',
})

/**
* @see routes/web.php:15
* @route '/leads'
*/
const leadsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leads.url(options),
    method: 'get',
})

/**
* @see routes/web.php:15
* @route '/leads'
*/
leadsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leads.url(options),
    method: 'get',
})

/**
* @see routes/web.php:15
* @route '/leads'
*/
leadsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leads.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

leads.form = leadsForm
```

Also add the corresponding route to your `routes/web.php` file:

```php
Route::get('/leads', function () {
    return Inertia::render('Leads/Leads');
})->middleware(['auth', 'verified'])->name('leads');
```

And add the leads navigation item to your sidebar or navigation menu.
