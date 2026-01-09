import "./simplified-button.css";

export default function SimplifiedButton(props) {
	const { children, className, ...otherProps } = props;
	return <button className={"simplified-button".concat(className ? " ".concat(className) : "")} {...otherProps}>{children}</button>
}