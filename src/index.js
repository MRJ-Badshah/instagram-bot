require('dotenv').config();
const express = require('express');
const app = express();
const Instagram = require('instagram-web-api');
const FileCookieStore = require('tough-cookie-filestore2');
const cookieStore = new FileCookieStore('./cookies.json');

app.use(express.json());

const client = new Instagram({
	username: process.env.IG_USERNAME,
	password: process.env.IG_PASSWORD,
	cookieStore,
});

app.get('/', (_req, res) => {
	res.send({ success: true });
});

app.get(`/${process.env.SECRET_PATH}`, async (req, res) => {
	const photo = req.query.image;
	const caption = req.query.caption;
	if (!photo) {
		return res.send({ success: false });
	}
	if (!caption) {
		return res.send({ success: false });
	}
	try {
		await client.login();
		const { media } = await client.uploadPhoto({ photo, caption, post: 'feed' });
		res.send({ link: `https://www.instagram.com/p/${media.code}/` });
	} catch (e) {
		console.log(e);
		return res.send({ success: false });
	}
});

app.get('/ig/:username', async (req, res) => {
	try {
		const user = await client.getUserByUsername({
			username: `${req.params.username}`,
		});
		res.send(user);
	} catch (e) {
		res.send({ success: false });
	}
});

app.listen(3000, () => {
	console.log(`App listening at http://localhost:${3000}`);
});