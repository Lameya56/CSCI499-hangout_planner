// src/data/mockMemories.js

import { id } from "date-fns/locale";
import { date } from "zod";

export const mockBoards = [
  {
    id: 1,
    title: "Summer 2025 ☀️",
    date: "June 15 - July 6, 2025",
    cover: "https://i.pinimg.com/736x/c2/f5/53/c2f553510aaed3c00bae74c70780da75.jpg",
    pins: [
      { id: 1, type: "image", content: "https://i.pinimg.com/736x/1f/b2/8d/1fb28de1cc4dfdef7dc0411c61ed45c2.jpg" },
      { id: 2, type: "note", content: "We laughed until 3am." },
      {id: 3, type: "image", content: "https://i.pinimg.com/1200x/8f/1b/6b/8f1b6bd31e2db05d42259e382bf4c080.jpg"},
      { id: 4, type: "note", content: "it was a fun time" },
      {id: 5, type: "image", content: "https://i.pinimg.com/1200x/b9/3f/de/b93fde302571a16058b1743af0de8ffc.jpg"},
      {id: 6, type: "note", content: "Can't wait for next year!"},
    {id: 7, type: "image", content: "https://i.pinimg.com/1200x/b1/95/91/b19591f7dda66c6c13e8da56e495111f.jpg"},
    {id: 8, type: "note", content: "Best vacation ever!"},
    {id: 9, type: "image", content: "https://i.pinimg.com/736x/42/aa/90/42aa90d87ad1f2c1bde55fd2744b9cdd.jpg"},
    {id: 10, type: "note", content: "So many great memories made."},
    {id: 11, type: "image", content: "https://i.pinimg.com/1200x/33/89/4b/33894bd36cef84712dfb0491d58d2d55.jpg"},
    {id: 12, type: "image", content: "https://i.pinimg.com/736x/d0/88/f2/d088f240c312fc6b3f16e7570f9417d3.jpg"},
    {id: 13, type: "image", content: "https://i.pinimg.com/736x/78/89/2f/78892ff451bf0a68797d24a0b2649185.jpg"},
    ]
  },
  {
    id: 2,
    title: "Hot Cocoa & Bad Decisions ☕❄️",
    date: "December 20 - December 27, 2025",
    cover: "https://i.pinimg.com/1200x/02/da/4e/02da4e54b88eb647e83252fbc1bc150d.jpg",
    pins: [
      { id: 1, type: "image", content: "https://i.pinimg.com/736x/1c/1b/39/1c1b39a23a65c587eaf20a2ff3e733eb.jpg" },
      { id: 2, type: "note", content: "Ski slopes and hot cocoa!" },
      { id: 3, type: "image", content: "https://i.pinimg.com/736x/e9/1f/e2/e91fe24d81a152cbfa936c0eefd1321b.jpg" },
      { id: 4, type: "image", content: "https://i.pinimg.com/736x/19/db/8d/19db8d6d9dc26e8f1f91893d6ccca312.jpg" },
      { id: 5, type: "image", content: "https://i.pinimg.com/736x/e3/b4/55/e3b45546958dc6cfe91c95a06175ea77.jpg" },
      { id: 6, type: "image", content: "https://i.pinimg.com/736x/e3/bf/b6/e3bfb613120f704305a7e11c5ff28344.jpg" },
      { id: 7, type: "note", content: "northern lights are so cool!" },
      { id: 8, type: "image", content: "https://i.pinimg.com/736x/9b/85/88/9b8588fd101e6ed097bc55cf5160cdcc.jpg" },
      { id: 9, type: "image", content: "https://i.pinimg.com/1200x/8b/32/6e/8b326e48d6f1d18d9ce8fdb3f8549eae.jpg" },
      { id: 10, type: "image", content: "https://i.pinimg.com/736x/db/18/76/db1876c208e672dbd2da8f986b5d02d2.jpg" },
      { id: 11, type: "image", content: "https://i.pinimg.com/736x/be/61/48/be6148fd942c738098147c9cdad3cfd2.jpg" },
      { id: 12, type: "image", content: "https://i.pinimg.com/736x/26/bd/0f/26bd0f4045f195effa5bb9013dfc765d.jpg" },
    ]
  },
  {
    id: 3,
    title: "Lost in Kyoto 🏮",
    date: "Jan 5 - Jan 15, 2025",
    cover: "https://i.pinimg.com/736x/21/59/e6/2159e6e4accbf87e6b9bdf919822ac10.jpg",
    pins: [
      { id: 1, type: "image", content: "https://i.pinimg.com/1200x/39/10/38/39103886eaad06258f18086be2ead973.jpg" },
      { id: 2, type: "note", content: "Can't wait to visit again!" },
      { id: 3, type: "image", content: "https://i.pinimg.com/1200x/b8/98/11/b898116687014fc8d5b4e37d45f75d75.jpg" },
      { id: 4, type: "image", content: "https://i.pinimg.com/1200x/56/dd/ec/56ddec6386857375a6b61135e4e996f8.jpg" },
        { id: 5, type: "note", content: "Too many shrines, not enough time." },
        { id: 6, type: "image", content: "https://i.pinimg.com/736x/71/e6/68/71e6686698600e418839af6e476da2c3.jpg" },
        { id: 7, type: "note", content: "We got lost but found the best matcha" },     
    ]
  },

];
