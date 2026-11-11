/**
 * Unified pointer and touch interaction for the dyno ECU/turbo curve graph.
 * Supports relative delta holding for touchscreens so touching does not snap the value.
 */
export function nfsuDynoCurve() {
    return {
        restrict: 'A',
        link(scope, element) {
            const editorScope = scope;
            const svg = element[0];
            let activePointerId = null;
            let isDragging = false;
            const isTouchEvent = (e) => {
                if ('pointerType' in e) {
                    const pt = e.pointerType;
                    return pt === 'touch' || pt === 'pen';
                }
                return 'touches' in e || 'targetTouches' in e;
            };
            const getPointEvent = (e, buttons, isTouch) => {
                let clientX = 0, clientY = 0;
                if ('touches' in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }
                else if ('changedTouches' in e && e.changedTouches.length > 0) {
                    clientX = e.changedTouches[0].clientX;
                    clientY = e.changedTouches[0].clientY;
                }
                else if ('clientX' in e) {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }
                return {
                    clientX,
                    clientY,
                    buttons,
                    currentTarget: svg,
                    target: svg,
                    isTouch,
                    preventDefault: () => {
                        if (e.cancelable)
                            e.preventDefault();
                    },
                };
            };
            const start = (e) => {
                const pe = e;
                if ('button' in pe && pe.button !== 0)
                    return;
                if (e.cancelable)
                    e.preventDefault();
                isDragging = true;
                if ('pointerId' in pe) {
                    activePointerId = pe.pointerId;
                    try {
                        svg.setPointerCapture(pe.pointerId);
                    }
                    catch { }
                }
                const isTouch = isTouchEvent(e);
                const synthetic = getPointEvent(pe, 1, isTouch);
                editorScope.$applyAsync(() => {
                    editorScope.curvePointer(synthetic, true);
                });
            };
            const move = (e) => {
                if (!isDragging)
                    return;
                const pe = e;
                if ('pointerId' in pe && activePointerId !== null && pe.pointerId !== activePointerId)
                    return;
                const isTouch = isTouchEvent(e);
                if (!isTouch && 'buttons' in pe && pe.buttons === 0) {
                    end(e);
                    return;
                }
                if (e.cancelable)
                    e.preventDefault();
                const synthetic = getPointEvent(pe, 1, isTouch);
                editorScope.$applyAsync(() => {
                    editorScope.curvePointer(synthetic, false);
                });
            };
            const end = (e) => {
                if (!isDragging)
                    return;
                isDragging = false;
                if (activePointerId !== null) {
                    try {
                        svg.releasePointerCapture(activePointerId);
                    }
                    catch { }
                    activePointerId = null;
                }
                editorScope.$applyAsync(() => {
                    editorScope.curvePointerUp();
                });
            };
            if (typeof window !== 'undefined' && 'PointerEvent' in window) {
                svg.addEventListener('pointerdown', start, { passive: false });
                svg.addEventListener('pointermove', move, { passive: false });
                svg.addEventListener('pointerup', end, { passive: false });
                svg.addEventListener('pointercancel', end, { passive: false });
            }
            else {
                svg.addEventListener('touchstart', start, { passive: false });
                svg.addEventListener('touchmove', move, { passive: false });
                svg.addEventListener('touchend', end, { passive: false });
                svg.addEventListener('touchcancel', end, { passive: false });
                svg.addEventListener('mousedown', start);
                svg.addEventListener('mousemove', move);
                svg.addEventListener('mouseup', end);
            }
            scope.$on('$destroy', () => {
                if (typeof window !== 'undefined' && 'PointerEvent' in window) {
                    svg.removeEventListener('pointerdown', start);
                    svg.removeEventListener('pointermove', move);
                    svg.removeEventListener('pointerup', end);
                    svg.removeEventListener('pointercancel', end);
                }
                else {
                    svg.removeEventListener('touchstart', start);
                    svg.removeEventListener('touchmove', move);
                    svg.removeEventListener('touchend', end);
                    svg.removeEventListener('touchcancel', end);
                    svg.removeEventListener('mousedown', start);
                    svg.removeEventListener('mousemove', move);
                    svg.removeEventListener('mouseup', end);
                }
            });
        },
    };
}
