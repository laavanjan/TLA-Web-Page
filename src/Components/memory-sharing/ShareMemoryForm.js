import React, { useMemo, useState } from "react";
import { Container, Grid } from "@mui/material";
import Heading from "../../shared/Heading";
import Input from "./../Input";
import { createMemory } from "../../helpers/server";
import { useAuth } from "../../providers/AuthProvider";

import "./share-memory-form.css";

/**
 * @param {FileList} files
 */
function readFiles(files) {
	const reader = new FileReader();
	/**
	 * @type {Array<ArrayBuffer>}
	 */
	const d = new Array(files.length);

	return new Promise((resolve, reject) => {
		function readFile(index) {
			const file = files[index];
			reader.onload = function (e) {
				const result = e.target.result;
				if (typeof result == "string") return;
				d[index] = result;

				if (index == files.length - 1) { resolve(d); return; }
				readFile(index + 1);
			}
			reader.onabort = function (e) {
				reject(e);
			}
			reader.readAsArrayBuffer(file);
		}
		readFile(0);
	});
}


const validateNotEmpty = (str) => {
	return str.length > 0;
}

function ShareMemoryForm({ closeModal }) {
	const auth = useAuth();
	const [formValid, setFormValid] = useState({
		title: true,
		description: true
	});
	const [buttonClicked, setButtonClicked] = useState(false);
	const [formData, setFormData] = useState(
		/**
		 * @type {import("../../helpers/server.js").CreateMemoryData}
		 */ ({
			title: "testing",
			description: "testinlkjaldskjlashdogasldkjalsdf",
			images: [],
		}));
	const [responseMessage, setResponseMessage] = useState("");

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));

		switch (name) {
			case 'title':
			case 'description':
				setFormValid((prevFormValid) => ({ ...prevFormValid, [name]: validateNotEmpty(value) }));
				break;
			default:
			// Handle default case if needed
		}
	};

	const imageUrls = useMemo(() => {
		const images = formData.images
		/**
		 * @type {string[]}
		 */
		const urls = new Array(images.length);
		for (let i = 0; i < images.length; i++) {
			urls[i] = URL.createObjectURL(images[i]);
		}
		return urls;

	}, [formData.images]);

	// make sure to call this before updating formData.images
	// to reduce unwanted memory usage
	// https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static#memory_management 
	const revokeImageUrls = () => {
		for (const url of imageUrls) {
			URL.revokeObjectURL(url);
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setButtonClicked(true);

		try {
			console.log(formValid);
			if (!formValid.title || !formValid.description) {
				return;
			}

			await createMemory(formData);
			setResponseMessage("உங்களுடைய நினைவு வெற்றிகரமாக பகிரப்பட்டுள்ளது")
			setTimeout(() => {
				closeModal();
			}, 1000);
			document.getElementsByClassName("response-message")[0].style.color = "green";

			revokeImageUrls();
			setFormData({
				title: "",
				description: "",
				images: [],
			});
			setButtonClicked(false);
		} catch (error) {
			setResponseMessage("உங்களுடைய நினைவு பகிரப்படவில்லை")
			document.getElementsByClassName("response-message")[0].style.color = "red";
		}
	};

	return (
		<Container>
			<Heading>உங்கள் நினைவு</Heading>

			<Grid>
				<Input
					onChange={handleInputChange}
					value={formData.title}
					name="title"
					label="தலைப்பு"
					showValidation={buttonClicked && !formData.title}
					validationMessage="தலைப்பை சரியாக உள்ளிடவும்"
				/>
				<Input
					onChange={handleInputChange}
					value={formData.description}
					name="description"
					label="விபரம்"
					as="textarea"
					showValidation={buttonClicked && !formData.description}
					validationMessage="விபரத்தை சரியாக உள்ளிடவும்"
				/>
				<Grid item className="input">
					<div className="label" style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}>
						படங்கள்
					</div>
					<div className="input-images-container">
						{imageUrls.map(image => {
							return <img src={image} key={image} />
						})}
						<label style={{ display: "contents" }}>
							<input type="file" multiple accept="image/*" onChange={async (event) => {
								const target = event.target;
								if (!(target instanceof HTMLInputElement) || target.type != "file" || target.files.length == 0) {
									return;
								}

								revokeImageUrls();
								const _files = new Array(target.files.length);
								for (let i = 0; i < target.files.length; i++) {
									_files[i] = target.files.item(i);
								}

								setFormData((prev) => ({
									...prev, images: _files
								}))
							}} />
							<div className="add-image-example">
								<span className="material-symbols-outlined" style={{
									fontSize: "28px"
								}}>
									add
								</span>
								<span>Add image</span>
							</div>
						</label>
					</div>
				</Grid>
				<Grid
					container
					item
					justifyContent="flex-end"
					paddingBottom={2}
					paddingTop={2}
				>
					<button className="contact-send-button" onClick={handleSubmit} >
						அனுப்பு
					</button>
				</Grid>
				<Grid item>
					<div className="response-message">{responseMessage}</div>
				</Grid>
				{/* <Grid container item justifyContent="center">
					<SimplifiedButton onClick={changeModal.bind(null, "signup")}>கணக்கை உருவாக்கு</SimplifiedButton>
				</Grid> */}
			</Grid>
		</Container>
	);
}
export default ShareMemoryForm;
