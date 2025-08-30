import dayjs from "dayjs";
import "dayjs/locale/ja";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);

dayjs.locale("ja");
dayjs.tz.setDefault("Asia/Tokyo");

export default dayjs;
