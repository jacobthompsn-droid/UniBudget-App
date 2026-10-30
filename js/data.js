/* UniBudget static data: categories, pilot deals, goal icons. */
window.UB_DATA = {
  categories: {
    food:      { label: 'Food',      icon: '🍔', color: '#E8961E', soft: '#FDF1DF' },
    transport: { label: 'Transport', icon: '🚌', color: '#2F6FED', soft: '#E8F0FD' },
    school:    { label: 'School',    icon: '📚', color: '#7C4DDB', soft: '#F0EAFC' },
    fun:       { label: 'Fun',       icon: '🎉', color: '#D63F86', soft: '#FCE8F1' },
    other:     { label: 'Other',     icon: '🧾', color: '#5B6878', soft: '#EEF1F5' }
  },
  /* Default share of the weekly budget for each category (Auto plan). */
  split: { food: 0.40, transport: 0.15, school: 0.15, fun: 0.20, other: 0.10 },

  /* Pilot offers. These are sample partners used while real
     local partnerships are signed; edit this list to add real deals. */
  deals: [
    { id: 'grind',    name: 'Campus Grind Coffee',    cat: 'Food',     offer: 'Free size upgrade with student ID', save: 1.5, where: '0.3 mi', code: 'GRIND-STU',  color: '#8B5A2B', terms: 'Any handcrafted drink. One per visit.' },
    { id: 'pages',    name: 'Page Turner Books',      cat: 'School',   offer: '20% off used textbooks',            save: 12,  where: '0.5 mi', code: 'PAGE20',     color: '#7C4DDB', terms: 'Used and rental textbooks only.' },
    { id: 'slice',    name: 'Slice Street Pizza',     cat: 'Food',     offer: '$5 slice and drink, Tue to Thu',     save: 3,   where: '0.6 mi', code: 'SLICE5',     color: '#D93A3F', terms: 'Dine in or carry out, Tuesday to Thursday.' },
    { id: 'byte',     name: 'Byte Repair & Tech',     cat: 'Tech',     offer: '10% off chargers and accessories',  save: 4,   where: '1.1 mi', code: 'BYTE10',     color: '#2F6FED', terms: 'Excludes phones and laptops.' },
    { id: 'thrift',   name: 'ThriftLoop',             cat: 'Shopping', offer: '25% off every Tuesday',             save: 6,   where: '0.9 mi', code: 'LOOP25',     color: '#0E8C8A', terms: 'Tuesdays only. Show student ID.' },
    { id: 'metro',    name: 'Metro Ride Pass',        cat: 'Travel',   offer: 'Half price monthly transit pass',   save: 15,  where: 'Citywide', code: 'RIDE50',   color: '#C77A0A', terms: 'Requires current enrollment.' },
    { id: 'greencart',name: 'GreenCart Market',       cat: 'Food',     offer: '10% off groceries on Sundays',      save: 3.5, where: '0.8 mi', code: 'GREEN10',    color: '#1F8A5B', terms: 'Sundays only, in store.' },
    { id: 'print',    name: 'QuickPrint Copy Center', cat: 'School',   offer: '50 free prints every month',        save: 5,   where: 'On campus', code: 'PRINT50', color: '#13294B', terms: 'Black and white, letter size.' },
    { id: 'stream',   name: 'StreamBox Music',        cat: 'Tech',     offer: 'Premium plan 50% off',              save: 5.5, where: 'Online',  code: 'STUDENTBOX', color: '#1F2937', terms: 'Verify with a school email.' },
    { id: 'wheels',   name: 'Weekend Wheels',         cat: 'Travel',   offer: '$15 off intercity bus tickets',     save: 15,  where: 'Online',  code: 'WHEELS15',   color: '#C2357A', terms: 'Trips of $40 or more.' },
    { id: 'gym',      name: 'Flex Fitness Studio',    cat: 'Health',   offer: 'Student membership $15 a month',    save: 10,  where: '1.4 mi', code: 'FLEXSTU',    color: '#0F766E', terms: 'Month to month, cancel anytime.' },
    { id: 'cuts',     name: 'Fresh Fade Barbers',     cat: 'Health',   offer: '$5 off any cut',                    save: 5,   where: '0.7 mi', code: 'FADE5',      color: '#475569', terms: 'Monday to Thursday.' }
  ],
  dealCats: ['All', 'Food', 'School', 'Tech', 'Shopping', 'Travel', 'Health'],
  goalIcons: ['🎓', '🏖️', '💻', '🛟', '🚗', '🎧', '✈️', '🏠', '🎁', '📱']
};
