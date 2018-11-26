export default function classNames(...args) {
  const classes = [];
  args.forEach((arg) => {
    if (typeof (arg) === 'string') {
      classes.push(arg);
    } else if (typeof (arg) === 'object') {
      Object.keys(arg).forEach((className) => {
        if (arg[className]) {
          classes.push(className);
        }
      });
    }
  });
  return classes.join(' ');
}
