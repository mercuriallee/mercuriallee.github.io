import 'dart:math';

abstract class TreeNode<V extends Comparable> {
  bool get isEmpty;
  bool contains(V v);
  TreapNode<V> insert(V v);
  TreeNode<V> remove(V v);
  Iterable<TreapNode<V>> inorder();
  Iterable<TreapNode<V>> preorder();

  V? get maxOrNull;
  V? get minOrNull;
}

class EmptyTreeNode<V extends Comparable> extends TreeNode<V> {
  @override
  bool get isEmpty => true;
  @override
  bool contains(V v) => false;
  @override
  TreapNode<V> insert(V v) => TreapNode(
      value: v,
      left: EmptyTreeNode(),
      right: EmptyTreeNode(),
      rank: Random().nextDouble());
  TreeNode<V> remove(V v) => this;
  Iterable<TreapNode<V>> inorder() sync* {}
  Iterable<TreapNode<V>> preorder() sync* {}

  @override
  V? get maxOrNull => null;
  @override
  V? get minOrNull => null;
}

class TreapNode<V extends Comparable> extends TreeNode<V> {
  V value;
  double rank;
  TreeNode<V> left;
  TreeNode<V> right;

  bool get isEmpty => false;
  bool contains(V v) => v.compareTo(value) == 0
      ? true
      : (v.compareTo(value) < 0 ? left.contains(v) : right.contains(v));
  @override
  V? get maxOrNull =>
      right.isEmpty ? value : (right as TreapNode<V>).maxOrNull!;
  @override
  V? get minOrNull => left.isEmpty ? value : (left as TreapNode<V>).minOrNull!;
  @override
  TreapNode<V> insert(V v) {
    var node = v.compareTo(value) < 0
        ? TreapNode(
            value: value, left: left.insert(v), right: right, rank: rank)
        : TreapNode(
            value: value, left: left, right: right.insert(v), rank: rank);
    if (node.left is TreapNode && (node.left as TreapNode).rank > node.rank)
      node = node.rightRotate();
    else if (node.right is TreapNode &&
        (node.right as TreapNode).rank > node.rank) node = node.leftRotate();
    return node;
  }

  @override
  TreeNode<V> remove(V v) {
    if (!contains(v)) return this;
    if (v.compareTo(value) < 0)
      return TreapNode(
          value: value, left: left.remove(v), right: right, rank: rank);
    else if (v.compareTo(value) > 0)
      return TreapNode(
          value: value, left: left, right: right.remove(v), rank: rank);
    else {
      if (left.isEmpty) return right;
      if (right.isEmpty) return left;
      if ((left as TreapNode).rank < (right as TreapNode).rank) {
        return leftRotate().remove(v);
      } else {
        return rightRotate().remove(v);
      }
    }
  }

  TreapNode<V> leftRotate() {
    if (right.isEmpty) throw "Cannot left rotate a empty right child!";
    final rightChild = right as TreapNode<V>;
    final newLeft =
        TreapNode(value: value, left: left, right: rightChild.left, rank: rank);
    return TreapNode(
        value: rightChild.value,
        left: newLeft,
        right: rightChild.right,
        rank: rightChild.rank);
  }

  TreapNode<V> rightRotate() {
    if (left.isEmpty) throw "Cannot right rotate a empty left child!";
    final leftChild = left as TreapNode<V>;
    final newRight = TreapNode(
        value: value, left: leftChild.right, right: right, rank: rank);
    return TreapNode(
        value: leftChild.value,
        left: leftChild.left,
        right: newRight,
        rank: leftChild.rank);
  }

  Iterable<TreapNode<V>> inorder() sync* {
    for (final node in left.inorder()) yield node;
    yield this;
    for (final node in right.inorder()) yield node;
  }

  Iterable<TreapNode<V>> preorder() sync* {
    yield this;
    for (final node in left.inorder()) yield node;
    for (final node in right.inorder()) yield node;
  }

  TreapNode(
      {required this.value,
      required this.left,
      required this.right,
      required this.rank});
}
