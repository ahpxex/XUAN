import type { UserFormData } from "../atoms/ziwei";

const SURNAMES = [
	"李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴",
	"徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"
];

const GIVEN_NAMES = [
	"明", "华", "强", "伟", "磊", "军", "勇", "峰", "杰", "涛",
	"超", "浩", "亮", "宇", "鹏", "飞", "霞", "娜", "婷", "芳",
	"丽", "敏", "静", "玲", "慧", "梅", "红", "燕", "雪", "莉"
];

const SHICHEN_VALUES = [
	"zi", "chou", "yin", "mao", "chen", "si",
	"wu", "wei", "shen", "you", "xu", "hai"
];

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padZero(num: number): string {
	return num.toString().padStart(2, "0");
}

export function generateRandomUserData(): UserFormData {
	const birthYear = getRandomInt(1980, 2010);
	const birthMonth = getRandomInt(1, 12);
	const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
	const birthDay = getRandomInt(1, daysInMonth);

	const surname = getRandomItem(SURNAMES);
	const givenName1 = getRandomItem(GIVEN_NAMES);
	const givenName2 = Math.random() > 0.5 ? getRandomItem(GIVEN_NAMES) : "";
	const name = surname + givenName1 + givenName2;

	const gender = getRandomItem(["male", "female"]);
	const birthShichen = getRandomItem(SHICHEN_VALUES);

	return {
		name,
		gender,
		birthYear: birthYear.toString(),
		birthMonth: padZero(birthMonth),
		birthDay: padZero(birthDay),
		birthShichen,
	};
}

export function isDevelopment(): boolean {
	return import.meta.env.DEV;
}
