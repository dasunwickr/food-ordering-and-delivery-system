import AddMenuForm from '@/components/common/menu/addMenu/AddMenuForm';
import React from 'react';

function Page() {
  return (
    <div>
      <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800">Restaurant Menu Management</h1>
            <p className="text-amber-700 mt-2">Add delicious items to your menu</p>
          </div>
      <AddMenuForm/>
    </div>
  );
}

export default Page;
