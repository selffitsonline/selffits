export interface Country {
  code: string;       // ISO 2-letter code e.g. "IN"
  name: string;       // "India"
  dialCode: string;   // "+91"
  flag: string;       // "🇮🇳"
  minDigits: number;  // Minimum national number digits
  maxDigits: number;  // Maximum national number digits
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", minDigits: 10, maxDigits: 10 },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", minDigits: 10, maxDigits: 10 },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", minDigits: 10, maxDigits: 10 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", minDigits: 10, maxDigits: 11 },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", minDigits: 9, maxDigits: 9 },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", minDigits: 9, maxDigits: 9 },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", minDigits: 8, maxDigits: 8 },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", minDigits: 9, maxDigits: 9 },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", minDigits: 8, maxDigits: 10 },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", minDigits: 10, maxDigits: 11 },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", minDigits: 9, maxDigits: 9 },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", minDigits: 9, maxDigits: 10 },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", minDigits: 9, maxDigits: 9 },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦", minDigits: 8, maxDigits: 8 },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼", minDigits: 8, maxDigits: 8 },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲", minDigits: 8, maxDigits: 8 },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭", minDigits: 8, maxDigits: 8 },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", minDigits: 9, maxDigits: 10 },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", minDigits: 10, maxDigits: 10 },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", minDigits: 10, maxDigits: 10 },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", minDigits: 9, maxDigits: 9 },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", minDigits: 10, maxDigits: 10 },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", minDigits: 10, maxDigits: 10 },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", minDigits: 9, maxDigits: 12 },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", minDigits: 9, maxDigits: 10 },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", minDigits: 9, maxDigits: 9 },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", minDigits: 10, maxDigits: 10 },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷", minDigits: 9, maxDigits: 10 },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", minDigits: 11, maxDigits: 11 },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰", minDigits: 8, maxDigits: 8 },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", minDigits: 9, maxDigits: 9 },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", minDigits: 10, maxDigits: 10 },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", minDigits: 10, maxDigits: 10 },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", minDigits: 10, maxDigits: 11 },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", minDigits: 10, maxDigits: 10 },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", minDigits: 10, maxDigits: 10 },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", minDigits: 9, maxDigits: 9 },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪", minDigits: 9, maxDigits: 9 },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭", minDigits: 9, maxDigits: 9 },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹", minDigits: 10, maxDigits: 11 },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪", minDigits: 9, maxDigits: 9 },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴", minDigits: 8, maxDigits: 8 },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰", minDigits: 8, maxDigits: 8 },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮", minDigits: 9, maxDigits: 10 },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪", minDigits: 9, maxDigits: 9 },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱", minDigits: 9, maxDigits: 9 },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺", minDigits: 10, maxDigits: 10 },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷", minDigits: 10, maxDigits: 10 },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷", minDigits: 10, maxDigits: 10 },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱", minDigits: 9, maxDigits: 9 },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", minDigits: 9, maxDigits: 9 },
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫", minDigits: 9, maxDigits: 9 },
  { code: "AL", name: "Albania", dialCode: "+355", flag: "🇦🇱", minDigits: 8, maxDigits: 9 },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿", minDigits: 9, maxDigits: 9 },
  { code: "AD", name: "Andorra", dialCode: "+376", flag: "🇦🇩", minDigits: 6, maxDigits: 6 },
  { code: "AO", name: "Angola", dialCode: "+244", flag: "🇦🇴", minDigits: 9, maxDigits: 9 },
  { code: "AG", name: "Antigua & Barbuda", dialCode: "+1268", flag: "🇦🇬", minDigits: 10, maxDigits: 10 },
  { code: "AM", name: "Armenia", dialCode: "+374", flag: "🇦🇲", minDigits: 8, maxDigits: 8 },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: "🇦🇿", minDigits: 9, maxDigits: 9 },
  { code: "BS", name: "Bahamas", dialCode: "+1242", flag: "🇧🇸", minDigits: 10, maxDigits: 10 },
  { code: "BB", name: "Barbados", dialCode: "+1246", flag: "🇧🇧", minDigits: 10, maxDigits: 10 },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: "🇧🇾", minDigits: 9, maxDigits: 9 },
  { code: "BZ", name: "Belize", dialCode: "+501", flag: "🇧🇿", minDigits: 7, maxDigits: 7 },
  { code: "BJ", name: "Benin", dialCode: "+229", flag: "🇧🇯", minDigits: 8, maxDigits: 8 },
  { code: "BT", name: "Bhutan", dialCode: "+975", flag: "🇧🇹", minDigits: 8, maxDigits: 8 },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", minDigits: 8, maxDigits: 8 },
  { code: "BA", name: "Bosnia & Herzegovina", dialCode: "+387", flag: "🇧🇦", minDigits: 8, maxDigits: 8 },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: "🇧🇼", minDigits: 8, maxDigits: 8 },
  { code: "BN", name: "Brunei", dialCode: "+673", flag: "🇧🇳", minDigits: 7, maxDigits: 7 },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬", minDigits: 8, maxDigits: 9 },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: "🇧🇫", minDigits: 8, maxDigits: 8 },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: "🇧🇮", minDigits: 8, maxDigits: 8 },
  { code: "KH", name: "Cambodia", dialCode: "+855", flag: "🇰🇭", minDigits: 8, maxDigits: 9 },
  { code: "CM", name: "Cameroon", dialCode: "+237", flag: "🇨🇲", minDigits: 9, maxDigits: 9 },
  { code: "CV", name: "Cape Verde", dialCode: "+238", flag: "🇨🇻", minDigits: 7, maxDigits: 7 },
  { code: "CF", name: "Central African Republic", dialCode: "+236", flag: "🇨🇫", minDigits: 8, maxDigits: 8 },
  { code: "TD", name: "Chad", dialCode: "+235", flag: "🇹🇩", minDigits: 8, maxDigits: 8 },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", minDigits: 9, maxDigits: 9 },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", minDigits: 10, maxDigits: 10 },
  { code: "KM", name: "Comoros", dialCode: "+269", flag: "🇰🇲", minDigits: 7, maxDigits: 7 },
  { code: "CG", name: "Congo", dialCode: "+242", flag: "🇨🇬", minDigits: 9, maxDigits: 9 },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", minDigits: 8, maxDigits: 8 },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷", minDigits: 8, maxDigits: 9 },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺", minDigits: 8, maxDigits: 8 },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: "🇨🇾", minDigits: 8, maxDigits: 8 },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿", minDigits: 9, maxDigits: 9 },
  { code: "DJ", name: "Djibouti", dialCode: "+253", flag: "🇩🇯", minDigits: 8, maxDigits: 8 },
  { code: "DM", name: "Dominica", dialCode: "+1767", flag: "🇩🇲", minDigits: 10, maxDigits: 10 },
  { code: "DO", name: "Dominican Republic", dialCode: "+1809", flag: "🇩🇴", minDigits: 10, maxDigits: 10 },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", minDigits: 9, maxDigits: 9 },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻", minDigits: 8, maxDigits: 8 },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", flag: "🇬🇶", minDigits: 9, maxDigits: 9 },
  { code: "ER", name: "Eritrea", dialCode: "+291", flag: "🇪🇷", minDigits: 7, maxDigits: 7 },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: "🇪🇪", minDigits: 7, maxDigits: 8 },
  { code: "SZ", name: "Eswatini", dialCode: "+268", flag: "🇸🇿", minDigits: 8, maxDigits: 8 },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹", minDigits: 9, maxDigits: 9 },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯", minDigits: 7, maxDigits: 7 },
  { code: "GA", name: "Gabon", dialCode: "+241", flag: "🇬🇦", minDigits: 7, maxDigits: 8 },
  { code: "GM", name: "Gambia", dialCode: "+220", flag: "🇬🇲", minDigits: 7, maxDigits: 7 },
  { code: "GE", name: "Georgia", dialCode: "+995", flag: "🇬🇪", minDigits: 9, maxDigits: 9 },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", minDigits: 9, maxDigits: 9 },
  { code: "GD", name: "Grenada", dialCode: "+1473", flag: "🇬🇩", minDigits: 10, maxDigits: 10 },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹", minDigits: 8, maxDigits: 8 },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: "🇬🇳", minDigits: 9, maxDigits: 9 },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: "🇬🇾", minDigits: 7, maxDigits: 7 },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: "🇭🇹", minDigits: 8, maxDigits: 8 },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳", minDigits: 8, maxDigits: 8 },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺", minDigits: 9, maxDigits: 9 },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: "🇮🇸", minDigits: 7, maxDigits: 7 },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷", minDigits: 10, maxDigits: 10 },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶", minDigits: 10, maxDigits: 10 },
  { code: "CI", name: "Ivory Coast", dialCode: "+225", flag: "🇨🇮", minDigits: 10, maxDigits: 10 },
  { code: "JM", name: "Jamaica", dialCode: "+1876", flag: "🇯🇲", minDigits: 10, maxDigits: 10 },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴", minDigits: 9, maxDigits: 9 },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿", minDigits: 10, maxDigits: 10 },
  { code: "KI", name: "Kiribati", dialCode: "+686", flag: "🇰🇮", minDigits: 8, maxDigits: 8 },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", flag: "🇰🇬", minDigits: 9, maxDigits: 9 },
  { code: "LA", name: "Laos", dialCode: "+856", flag: "🇱🇦", minDigits: 9, maxDigits: 10 },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: "🇱🇻", minDigits: 8, maxDigits: 8 },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧", minDigits: 7, maxDigits: 8 },
  { code: "LS", name: "Lesotho", dialCode: "+266", flag: "🇱🇸", minDigits: 8, maxDigits: 8 },
  { code: "LR", name: "Liberia", dialCode: "+231", flag: "🇱🇷", minDigits: 7, maxDigits: 8 },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾", minDigits: 9, maxDigits: 9 },
  { code: "LI", name: "Liechtenstein", dialCode: "+423", flag: "🇱🇮", minDigits: 7, maxDigits: 7 },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: "🇱🇹", minDigits: 8, maxDigits: 8 },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺", minDigits: 9, maxDigits: 9 },
  { code: "MO", name: "Macao", dialCode: "+853", flag: "🇲🇴", minDigits: 8, maxDigits: 8 },
  { code: "MG", name: "Madagascar", dialCode: "+261", flag: "🇲🇬", minDigits: 9, maxDigits: 9 },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: "🇲🇼", minDigits: 9, maxDigits: 9 },
  { code: "MV", name: "Maldives", dialCode: "+960", flag: "🇲🇻", minDigits: 7, maxDigits: 7 },
  { code: "ML", name: "Mali", dialCode: "+223", flag: "🇲🇱", minDigits: 8, maxDigits: 8 },
  { code: "MT", name: "Malta", dialCode: "+356", flag: "🇲🇹", minDigits: 8, maxDigits: 8 },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: "🇲🇷", minDigits: 8, maxDigits: 8 },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: "🇲🇺", minDigits: 8, maxDigits: 8 },
  { code: "FM", name: "Micronesia", dialCode: "+691", flag: "🇫🇲", minDigits: 7, maxDigits: 7 },
  { code: "MD", name: "Moldova", dialCode: "+373", flag: "🇲🇩", minDigits: 8, maxDigits: 8 },
  { code: "MC", name: "Monaco", dialCode: "+377", flag: "🇲🇨", minDigits: 8, maxDigits: 9 },
  { code: "MN", name: "Mongolia", dialCode: "+976", flag: "🇲🇳", minDigits: 8, maxDigits: 8 },
  { code: "ME", name: "Montenegro", dialCode: "+382", flag: "🇲🇪", minDigits: 8, maxDigits: 8 },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦", minDigits: 9, maxDigits: 9 },
  { code: "MZ", name: "Mozambique", dialCode: "+258", flag: "🇲🇿", minDigits: 9, maxDigits: 9 },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲", minDigits: 8, maxDigits: 10 },
  { code: "NA", name: "Namibia", dialCode: "+264", flag: "🇳🇦", minDigits: 9, maxDigits: 9 },
  { code: "NR", name: "Nauru", dialCode: "+674", flag: "🇳🇷", minDigits: 7, maxDigits: 7 },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮", minDigits: 8, maxDigits: 8 },
  { code: "NE", name: "Niger", dialCode: "+227", flag: "🇳🇪", minDigits: 8, maxDigits: 8 },
  { code: "KP", name: "North Korea", dialCode: "+850", flag: "🇰🇵", minDigits: 8, maxDigits: 10 },
  { code: "MK", name: "North Macedonia", dialCode: "+389", flag: "🇲🇰", minDigits: 8, maxDigits: 8 },
  { code: "PW", name: "Palau", dialCode: "+680", flag: "🇵🇼", minDigits: 7, maxDigits: 7 },
  { code: "PS", name: "Palestine", dialCode: "+970", flag: "🇵🇸", minDigits: 9, maxDigits: 9 },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦", minDigits: 8, maxDigits: 8 },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: "🇵🇬", minDigits: 8, maxDigits: 8 },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", minDigits: 9, maxDigits: 9 },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪", minDigits: 9, maxDigits: 9 },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹", minDigits: 9, maxDigits: 9 },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴", minDigits: 9, maxDigits: 9 },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", minDigits: 9, maxDigits: 9 },
  { code: "KN", name: "Saint Kitts & Nevis", dialCode: "+1869", flag: "🇰🇳", minDigits: 10, maxDigits: 10 },
  { code: "LC", name: "Saint Lucia", dialCode: "+1758", flag: "🇱🇨", minDigits: 10, maxDigits: 10 },
  { code: "VC", name: "Saint Vincent", dialCode: "+1784", flag: "🇻🇨", minDigits: 10, maxDigits: 10 },
  { code: "WS", name: "Samoa", dialCode: "+685", flag: "🇼🇸", minDigits: 7, maxDigits: 7 },
  { code: "SM", name: "San Marino", dialCode: "+378", flag: "🇸🇲", minDigits: 10, maxDigits: 10 },
  { code: "ST", name: "Sao Tome & Principe", dialCode: "+239", flag: "🇸🇹", minDigits: 7, maxDigits: 7 },
  { code: "SN", name: "Senegal", dialCode: "+221", flag: "🇸🇳", minDigits: 9, maxDigits: 9 },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: "🇷🇸", minDigits: 8, maxDigits: 9 },
  { code: "SC", name: "Seychelles", dialCode: "+248", flag: "🇸🇨", minDigits: 7, maxDigits: 7 },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: "🇸🇱", minDigits: 8, maxDigits: 8 },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: "🇸🇰", minDigits: 9, maxDigits: 9 },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: "🇸🇮", minDigits: 8, maxDigits: 8 },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: "🇸🇧", minDigits: 7, maxDigits: 7 },
  { code: "SO", name: "Somalia", dialCode: "+252", flag: "🇸🇴", minDigits: 8, maxDigits: 9 },
  { code: "SS", name: "South Sudan", dialCode: "+211", flag: "🇸🇸", minDigits: 9, maxDigits: 9 },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩", minDigits: 9, maxDigits: 9 },
  { code: "SR", name: "Suriname", dialCode: "+597", flag: "🇸🇷", minDigits: 7, maxDigits: 7 },
  { code: "SY", name: "Syria", dialCode: "+963", flag: "🇸🇾", minDigits: 9, maxDigits: 9 },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: "🇹🇼", minDigits: 9, maxDigits: 9 },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", flag: "🇹🇯", minDigits: 9, maxDigits: 9 },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", minDigits: 9, maxDigits: 9 },
  { code: "TL", name: "Timor-Leste", dialCode: "+670", flag: "🇹🇱", minDigits: 7, maxDigits: 7 },
  { code: "TG", name: "Togo", dialCode: "+228", flag: "🇹🇬", minDigits: 8, maxDigits: 8 },
  { code: "TO", name: "Tonga", dialCode: "+676", flag: "🇹🇴", minDigits: 5, maxDigits: 7 },
  { code: "TT", name: "Trinidad & Tobago", dialCode: "+1868", flag: "🇹🇹", minDigits: 10, maxDigits: 10 },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳", minDigits: 8, maxDigits: 8 },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", flag: "🇹🇲", minDigits: 8, maxDigits: 8 },
  { code: "TV", name: "Tuvalu", dialCode: "+688", flag: "🇹🇻", minDigits: 5, maxDigits: 6 },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", minDigits: 9, maxDigits: 9 },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦", minDigits: 9, maxDigits: 9 },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", minDigits: 8, maxDigits: 8 },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: "🇺🇿", minDigits: 9, maxDigits: 9 },
  { code: "VU", name: "Vanuatu", dialCode: "+678", flag: "🇻🇺", minDigits: 7, maxDigits: 7 },
  { code: "VA", name: "Vatican City", dialCode: "+379", flag: "🇻🇦", minDigits: 10, maxDigits: 10 },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", minDigits: 10, maxDigits: 10 },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪", minDigits: 9, maxDigits: 9 },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲", minDigits: 9, maxDigits: 9 },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼", minDigits: 9, maxDigits: 9 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

export function getCountryByNameOrCode(value?: string): Country {
  if (!value) return DEFAULT_COUNTRY;
  const normalized = value.trim().toLowerCase();
  const found = COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.code.toLowerCase() === normalized ||
      c.dialCode === value.trim()
  );
  return found || DEFAULT_COUNTRY;
}

export function validatePhoneNumberForCountry(
  phone: string,
  countryNameOrCode: string
): { isValid: boolean; message?: string; formatted?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: "Phone number is required" };
  }

  const country = getCountryByNameOrCode(countryNameOrCode);
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  let nationalDigits = cleanPhone;
  if (cleanPhone.startsWith(country.dialCode)) {
    nationalDigits = cleanPhone.slice(country.dialCode.length);
  } else if (cleanPhone.startsWith("+")) {
    return {
      isValid: false,
      message: `Phone number must match selected country code (${country.dialCode})`,
    };
  }

  if (!/^\d+$/.test(nationalDigits)) {
    return {
      isValid: false,
      message: "Phone number must contain only numeric digits",
    };
  }

  if (nationalDigits.length < country.minDigits || nationalDigits.length > country.maxDigits) {
    if (country.minDigits === country.maxDigits) {
      return {
        isValid: false,
        message: `${country.name} phone number must be exactly ${country.minDigits} digits after ${country.dialCode}`,
      };
    } else {
      return {
        isValid: false,
        message: `${country.name} phone number must be between ${country.minDigits} and ${country.maxDigits} digits after ${country.dialCode}`,
      };
    }
  }

  const formatted = `${country.dialCode} ${nationalDigits}`;
  return { isValid: true, formatted };
}
