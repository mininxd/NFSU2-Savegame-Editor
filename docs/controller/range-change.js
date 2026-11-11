/** Native input events only: changing the bounds or rendering a loaded value must not create a draft. */
export function nfsuRangeChange() {
    return {
        restrict: 'A',
        link(scope, element, attrs) {
            const input = element[0];
            const change = () => scope.$evalAsync(() => scope.$eval(attrs['nfsuRangeChange'], { $value: Number(input.value) }));
            element.on('input', change);
            scope.$on('$destroy', () => element.off('input', change));
        },
    };
}
