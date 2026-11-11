/**
 * Directive that forwards a file input's `change` event to a scope function.
 * Usage: `<input type="file" nfsu-file-change="loadFile">`.
 */
export function nfsuFileChange() {
    return {
        restrict: 'A',
        link(scope, element, attrs) {
            element.on('change', (event) => {
                const input = event.target;
                const file = input.files && input.files[0];
                scope.$apply(() => {
                    const name = attrs['nfsuFileChange'];
                    const handler = scope[name];
                    handler(file ?? null);
                });
            });
        },
    };
}
