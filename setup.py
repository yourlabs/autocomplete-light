from setuptools import setup


setup(
    name='autocomplete-light',
    versioning='dev',
    setup_requires='setupmeta',
    extras_require=dict(
        test=[
            'pytest',
            'pytest-cov',
            'pytest-splinter',
        ],
    ),
    author='James Pic',
    author_email='jamespic@gmail.com',
    url='https://yourlabs.io/oss/autocomplete-light',
    include_package_data=True,
    license='MIT',
    keywords='html autocomplete',
    python_requires='>=3.8',
)
