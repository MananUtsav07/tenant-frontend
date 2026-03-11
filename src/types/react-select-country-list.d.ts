declare module 'react-select-country-list' {
  export type CountryDataOption = {
    value: string
    label: string
  }

  export type CountryListInstance = {
    getData: () => CountryDataOption[]
  }

  export default function countryList(): CountryListInstance
}
