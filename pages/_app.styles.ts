import { css } from '@emotion/react';

export const lightTheme = {
  body: {
    background: '#fff',
    color: '#000',
  },
};

export const darkTheme = {
  body: {
    background: '#000',
    color: '#fff',
  },
};

export const styles = {
  container: css`
    display: flex;
    align-items: center;
  `,

  username: css`
    margin-left: 10px;
  `,

  square: css`
    background: #fff;
    border: 1px solid #999;
    float: left;
    font-size: 50px;
    font-weight: bold;
    line-height: 34px;
    height: 80px;
    margin-right: -1px;
    margin-top: -1px;
    padding: 0;
    text-align: center;
    width: 80px;
  `,
  emptySquare: css`
    :hover {
      background-color: #c0c0c0;
    }
  `,
  winLine: css`
    background-color: yellow;
  `,

  boardRow: css`
    //display: flex;
    //flex-direction: row; rowにすると横に並ぶ
    display: grid;
    grid-template-rows: 80px;
    grid-template-columns: 80px 80px 80px;
  `,
  yonmokuBoardRow: css`
    display: grid;
    grid-template-rows: 80px;
    grid-template-columns: 80px 80px 80px 80px;
  `,
  game: css``,
  gameInfo: css`
    margin-left: 20px;
    @media (max-width: 767px) {
      padding-top: 30px;
    }
  `,
  status: css`
    margin-bottom: 10px;
    font: italic small-caps bold 16px/2 cursive;
    font-weight: bold;
    font-size: 30px;
  `,
  button: css`
    font: italic small-caps bold 16px/2 cursive;
    margin: 2px;
    font-size: 16px;
    color: white;
    background-color: black;
    cursor: default;
    :hover {
      background-color: white;
      color: black;
    }
  `,
  description: css`
    font: italic small-caps bold 16px/2 cursive;
    margin: 2px;
    font-size: 16px;
    color: white;
    background-color: black;
    cursor: default;
    :hover {
      background-color: white;
      color: black;
    }
  `,
  h4: css`
    font: italic small-caps bold 16px/2 cursive;
  `,
  pageContainer: css`
    @media (min-width: 768px) {
      height: 100vh;
      display: grid;
      grid-template-columns: auto auto;
      justify-content: center;
      align-items: center;
    }

    @media (max-width: 767px) {
      height: 100vh;
      display: grid;
      justify-content: center;
      align-items: center;
      grid-template-rows: auto auto;
    }
  `,
};
