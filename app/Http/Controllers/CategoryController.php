<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories', [
            'categories' => Category::where('is_deleted', false)->orderBy('name')->paginate(10),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create($validated);

        return back()->with('status', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return back()->with('status', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // We use soft delete as per system design
        $category->update(['is_deleted' => true]);

        return back()->with('status', 'Category removed successfully.');
    }
}
