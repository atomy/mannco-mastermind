import React, { useEffect, useState } from 'react';
import '@styles/app.scss';
import icons from '@components/icons';
const Application = () => {
    const [counter, setCounter] = useState(0);
    const [darkTheme, setDarkTheme] = useState(true);
    const [versions, setVersions] = useState({});
    /**
     * On component mount
     */
    useEffect(() => {
        const useDarkTheme = parseInt(localStorage.getItem('dark-mode'));
        if (isNaN(useDarkTheme)) {
            setDarkTheme(true);
        }
        else if (useDarkTheme == 1) {
            setDarkTheme(true);
        }
        else if (useDarkTheme == 0) {
            setDarkTheme(false);
        }
        // Apply verisons
        const app = document.getElementById('app');
        const versions = JSON.parse(app.getAttribute('data-versions'));
        setVersions(versions);
    }, []);
    /**
     * On Dark theme change
     */
    useEffect(() => {
        if (darkTheme) {
            localStorage.setItem('dark-mode', '1');
            document.body.classList.add('dark-mode');
        }
        else {
            localStorage.setItem('dark-mode', '0');
            document.body.classList.remove('dark-mode');
        }
    }, [darkTheme]);
    /**
     * Toggle Theme
     */
    function toggleTheme() {
        setDarkTheme(!darkTheme);
    }
    return (React.createElement("div", { id: "erwt" },
        React.createElement("div", { className: "header" },
            React.createElement("div", { className: "main-heading" },
                React.createElement("h1", { className: "themed" }, "ERWT - Electron Boilerplate")),
            React.createElement("div", { className: "main-teaser" }, "Desktop Application with Electron, React, Webpack & TypeScript"),
            React.createElement("div", { className: "versions" },
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.electron }),
                        " Electron"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.electron)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.erwt }),
                        " ERWT"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.erwt)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.typescript }),
                        " Typescript"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.typescript)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.nodejs }),
                        " Nodejs"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.node)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.react }),
                        " React"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.react)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.webpack }),
                        " Webpack"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.webpack)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.chrome }),
                        " Chrome"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.chrome)),
                React.createElement("div", { className: "item" },
                    React.createElement("div", null,
                        React.createElement("img", { className: "item-icon", src: icons.license }),
                        " License"),
                    React.createElement("span", null, versions === null || versions === void 0 ? void 0 : versions.license)))),
        React.createElement("div", { className: "footer" },
            React.createElement("div", { className: "center" },
                React.createElement("button", { onClick: () => {
                        if (counter > 99)
                            return alert('Going too high!!');
                        setCounter(counter + 1);
                    } },
                    "Increment ",
                    counter != 0 ? counter : '',
                    " ",
                    React.createElement("span", null, counter)),
                "\u00A0\u00A0 \u00A0\u00A0",
                React.createElement("button", { onClick: () => {
                        if (counter == 0)
                            return alert('Oops.. thats not possible!');
                        setCounter(counter > 0 ? counter - 1 : 0);
                    } },
                    "Decrement ",
                    React.createElement("span", null, counter)),
                "\u00A0\u00A0 \u00A0\u00A0",
                React.createElement("button", { onClick: toggleTheme }, darkTheme ? 'Light Theme' : 'Dark Theme')))));
};
export default Application;
//# sourceMappingURL=Application.js.map