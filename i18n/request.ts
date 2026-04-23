import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
const locales = ['ar', 'en'];
 
export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale)) notFound();
 
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
