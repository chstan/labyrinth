import _ from 'lodash';

const routerUtils = {
  forAttemptsSection: (chamber, section) => {
    const base = `/learn/chamber/${ chamber.dbId }/${ _.kebabCase(chamber.name) }/`;
    const sectionFrag = `${ section.dbId }/${ _.kebabCase(section.name) }`;
    return base + sectionFrag;
  },
};

export default routerUtils;
