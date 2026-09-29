import React, { useEffect } from 'react';
import { updateDocumentSEO, SEOProps } from '../utils/seo';

export const SEOHead: React.FC<SEOProps> = (props) => {
  useEffect(() => {
    const cleanup = updateDocumentSEO(props);
    return cleanup;
  }, [
    props.title,
    props.description,
    props.canonicalPath,
    props.noindex,
    props.ogType,
    props.ogImage,
    JSON.stringify(props.breadcrumbs),
    JSON.stringify(props.schema)
  ]);

  return null;
};

export default SEOHead;
