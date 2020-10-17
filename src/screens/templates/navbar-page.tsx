/** @jsx jsx */
import { jsx } from "@emotion/core";

import TopAppBar, {
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@material/react-top-app-bar";
import React from "react";
import { ClipLoader } from "react-spinners";
const appName = process.env.REACT_APP_APP_NAME;

type NavbarPageTemplateProps = React.PropsWithChildren<{}> & {
  navbarTitle?: string;
  loading?: boolean;
};

function NavbarPageTemplate({
  children,
  navbarTitle,
  loading = false,
}: NavbarPageTemplateProps) {
  return (
    <div>
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection align="start">
            <TopAppBarTitle>{navbarTitle ?? appName}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection align="end" role="toolbar">
            {loading && (
              <TopAppBarIcon actionItem tabIndex={0}>
                <ClipLoader loading color="#ffffff" size={20} />
              </TopAppBarIcon>
            )}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust>{children}</TopAppBarFixedAdjust>
    </div>
  );
}

export default NavbarPageTemplate;
