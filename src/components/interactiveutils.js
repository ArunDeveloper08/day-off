import { isNotDefined, isDefined } from "react-stockcharts/lib/utils";
import { useState, useRef, useCallback } from "react";

// Custom hook to manage interactive nodes
export function useInteractiveNodes() {
    const interactiveNodes = useRef({});

    const saveInteractiveNode = useCallback((chartId) => (node) => {
        interactiveNodes.current[`node_${chartId}`] = node;
    }, []);

    const saveInteractiveNodes = useCallback((type, chartId) => (node) => {
        if (isNotDefined(interactiveNodes.current)) {
            interactiveNodes.current = {};
        }
        const key = `${type}_${chartId}`;
        if (isDefined(node) || isDefined(interactiveNodes.current[key])) {
            interactiveNodes.current = {
                ...interactiveNodes.current,
                [key]: { type, chartId, node },
            };
        }
    }, []);

    const getInteractiveNodes = useCallback(() => {
        return interactiveNodes.current;
    }, []);

    return {
        saveInteractiveNode,
        saveInteractiveNodes,
        getInteractiveNodes,
    };
}

// Hook for handling selection
export function useSelection() {
    const [state, setState] = useState({});

    const handleSelection = useCallback((type, chartId) => (selectionArray) => {
        const key = `${type}_${chartId}`;
        const interactive = state[key]?.map((each, idx) => {
            return {
                ...each,
                selected: selectionArray[idx],
            };
        });

        setState(prevState => ({
            ...prevState,
            [key]: interactive,
        }));
    }, [state]);

    return {
        state,
        handleSelection,
    };
}
