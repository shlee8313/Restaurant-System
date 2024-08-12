//file: \app\components\Menuform.js

"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { Tabs, Tab, TabPanel } from "./TabComponent";

export default function MenuForm({ menu, onSave }) {
  const [categories, setCategories] = useState(menu.categories || []);
  const [editableItem, setEditableItem] = useState({ categoryIndex: null, itemIndex: null });
  const [activeTab, setActiveTab] = useState(0);
  const [newCategoryId, setNewCategoryId] = useState(null);

  const addCategory = () => {
    const newCategoryId = uuidv4();
    const newCategoryIndex = categories.length;
    const newCategory = { id: newCategoryId, name: "", items: [] };
    setCategories([...categories, newCategory]);
    setActiveTab(newCategoryIndex);
    setEditableItem({ categoryIndex: newCategoryIndex, itemIndex: null });
    setNewCategoryId(newCategoryId);
  };

  const addMenuItem = (categoryIndex) => {
    const newCategories = [...categories];
    const newItemIndex = newCategories[categoryIndex].items.length;
    newCategories[categoryIndex].items.push({
      id: uuidv4(),
      name: "",
      description: "",
      price: 0,
      image: "",
    });
    setCategories(newCategories);
    setEditableItem({ categoryIndex, itemIndex: newItemIndex });
    if (newCategories[categoryIndex].id === newCategoryId) {
      setNewCategoryId(null);
    }
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
  };

  const updateMenuItem = (categoryIndex, itemIndex, field, value) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex][field] = value;
    setCategories(newCategories);
  };

  const deleteCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    if (activeTab >= newCategories.length) {
      setActiveTab(Math.max(0, newCategories.length - 1));
    }
    setEditableItem({ categoryIndex: null, itemIndex: null });
    setNewCategoryId(null);
  };

  const deleteMenuItem = (categoryIndex, itemIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setCategories(newCategories);
    setEditableItem({ categoryIndex: null, itemIndex: null });
  };

  const handleEditItem = (categoryIndex, itemIndex) => {
    setEditableItem({ categoryIndex, itemIndex });
  };

  const handleFinishEdit = () => {
    setEditableItem({ categoryIndex: null, itemIndex: null });
  };

  const handleCancelAdd = (categoryIndex, itemIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setCategories(newCategories);
    setEditableItem({ categoryIndex: null, itemIndex: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...menu, categories });
  };

  const formatPrice = (price) => price.toLocaleString();

  const handleTabChange = (newTabIndex) => {
    setActiveTab(newTabIndex);
  };

  const isCategoryEmpty = (category) => {
    return category.items.length === 0;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-9xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg pb-20"
    >
      <Tabs value={activeTab} onChange={handleTabChange}>
        {categories.map((category, index) => (
          <Tab key={category.id} value={index}>
            {category.name ||
              (category.id === newCategoryId || isCategoryEmpty(category)
                ? "카테고리 추가"
                : "메뉴 추가")}
          </Tab>
        ))}
      </Tabs>

      {categories.map((category, categoryIndex) => (
        <TabPanel key={category.id} value={activeTab} index={categoryIndex}>
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(categoryIndex, "name", e.target.value)}
                placeholder="카테고리 이름"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => deleteCategory(categoryIndex)}
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
              >
                카테고리 삭제
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item, itemIndex) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  {(editableItem.categoryIndex === categoryIndex &&
                    editableItem.itemIndex === itemIndex) ||
                  (item.name === "" &&
                    item.description === "" &&
                    item.price === 0 &&
                    item.image === "") ? (
                    <>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateMenuItem(categoryIndex, itemIndex, "name", e.target.value)
                        }
                        placeholder="메뉴 이름"
                        className="w-full px-3 py-2 mb-2 border rounded-md"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateMenuItem(categoryIndex, itemIndex, "description", e.target.value)
                        }
                        placeholder="설명"
                        className="w-full px-3 py-2 mb-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={formatPrice(item.price)}
                        onChange={(e) =>
                          updateMenuItem(
                            categoryIndex,
                            itemIndex,
                            "price",
                            Number(e.target.value.replace(/,/g, ""))
                          )
                        }
                        placeholder="가격"
                        className="w-full px-3 py-2 mb-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) =>
                          updateMenuItem(categoryIndex, itemIndex, "image", e.target.value)
                        }
                        placeholder="이미지 URL"
                        className="w-full px-3 py-2 mb-2 border rounded-md"
                      />
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleFinishEdit}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                        >
                          완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelAdd(categoryIndex, itemIndex)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
                        >
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-full h-40 mb-2">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-lg font-bold text-green-600 mb-2">
                        {formatPrice(item.price)}원
                      </p>
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => handleEditItem(categoryIndex, itemIndex)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMenuItem(categoryIndex, itemIndex)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addMenuItem(categoryIndex)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              {category.id === newCategoryId || isCategoryEmpty(category)
                ? "카테고리 추가"
                : "메뉴 추가"}
            </button>
          </div>
        </TabPanel>
      ))}
      <div className="fixed bottom-0 right-20 bg-white shadow-lg flex justify-between p-4">
        <button
          type="button"
          onClick={addCategory}
          className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300 mr-4"
        >
          카테고리 추가
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        >
          전체 메뉴 저장
        </button>
      </div>
    </form>
  );
}
